"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Visibility = "private" | "class" | "public";

export type ContentSource = {
  id: string;
  kind: "url" | "pdf" | "image";
  title: string | null;
  url: string | null;
  storage_path: string | null;
  notes: string | null;
  visibility: Visibility;
  created_at: string | null;
};

type Props = {
  initialSources: ContentSource[];
};

const linkSchema = z.object({
  title: z
    .string()
    .min(2, "Informe um titulo descritivo")
    .max(120, "Titulo muito longo"),
  url: z.string().url("Informe uma URL valida"),
  notes: z.string().max(500, "Resumo muito longo").optional(),
  visibility: z.enum(["private", "class", "public"]),
});

type LinkFormValues = z.infer<typeof linkSchema>;

export function ContentManager({ initialSources }: Props) {
  const session = useSession();
  const userId = session?.user?.id;
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();

  const [sources, setSources] = useState(initialSources);
  const [activeTab, setActiveTab] = useState<"upload" | "link">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [uploadVisibility, setUploadVisibility] =
    useState<Visibility>("private");
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [signedUrlLoading, setSignedUrlLoading] = useState<string | null>(null);
  const [ingestingId, setIngestingId] = useState<string | null>(null);
  const [contentMessage, setContentMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      visibility: "private",
    },
  });

  const refreshSources = async () => {
    const { data, error } = await supabase
      .from("content_sources")
      .select(
        "id, kind, title, url, storage_path, notes, visibility, created_at",
      )
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSources(data as ContentSource[]);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadMessage(null);

    if (!file || !userId) {
      setUploadMessage("Selecione um arquivo para fazer upload.");
      return;
    }

    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");

    if (!isPdf && !isImage) {
      setUploadMessage("Apenas PDFs ou imagens sao aceitos.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadMessage("Limite de 25MB por arquivo.");
      return;
    }

    setUploading(true);

    try {
      const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
      const storagePath = `${userId}/${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("study-docs")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) {
        throw uploadError;
      }

      const payload: Database["public"]["Tables"]["content_sources"]["Insert"] = {
        kind: isPdf ? "pdf" : "image",
        storage_path: storagePath,
        visibility: uploadVisibility,
        title: file.name,
        notes: uploadNotes ? uploadNotes.trim() : null,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any)
        .from("content_sources")
        .insert(payload);

      if (insertError) {
        throw insertError;
      }

      setUploadMessage("Upload concluido!");
      setFile(null);
      setUploadNotes("");
      await refreshSources();
      router.refresh();
    } catch (err) {
      setUploadMessage(
        err instanceof Error ? err.message : "Falha ao fazer upload.",
      );
    } finally {
      setUploading(false);
    }
  };

  const onSubmitLink = async (values: LinkFormValues) => {
    try {
      const payload: Database["public"]["Tables"]["content_sources"]["Insert"] = {
        kind: "url",
        url: values.url,
        title: values.title,
        notes: values.notes ?? null,
        visibility: values.visibility,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("content_sources")
        .insert(payload);

      if (error) throw error;

      reset();
      await refreshSources();
      router.refresh();
    } catch (err) {
      throw err instanceof Error
        ? new Error(err.message)
        : new Error("Falha ao cadastrar URL");
    }
  };

  const handleOpenSource = async (source: ContentSource) => {
    if (source.kind === "url" && source.url) {
      window.open(source.url, "_blank");
      return;
    }

    if (!source.storage_path) return;

    setSignedUrlLoading(source.id);
    try {
      const signed = await requestSignedUrl(source.storage_path);
      if (signed) {
        window.open(signed, "_blank");
      }
    } finally {
      setSignedUrlLoading(null);
    }
  };

  const handleIngest = async (source: ContentSource) => {
    if (!source.id) return;
    setIngestingId(source.id);
    setContentMessage(null);
    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sourceId: source.id, type: source.kind }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error ?? "Falha ao enfileirar ingestao");
      }

      setContentMessage("Ingestao iniciada. Voce recebera os novos itens em breve.");
    } catch (err) {
      setContentMessage(
        err instanceof Error ? err.message : "Erro ao acionar ingestao.",
      );
    } finally {
      setIngestingId(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Adicionar conteudo</h2>
              <div className="flex gap-2 rounded-full border border-border p-1">
                <button
                  type="button"
                  className={`rounded-full px-4 py-1 text-sm font-semibold transition ${
                    activeTab === "upload"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab("upload")}
                >
                  Upload
                </button>
                <button
                  type="button"
                  className={`rounded-full px-4 py-1 text-sm font-semibold transition ${
                    activeTab === "link"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab("link")}
                >
                  Link/Playlist
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Armazene materiais no bucket seguro ou cadastre recursos externos
              para gerar quizzes e playlists.
            </p>
          </CardHeader>
          <CardContent>
            {activeTab === "upload" ? (
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="file">Arquivo</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(event) => {
                      const nextFile = event.target.files?.[0] ?? null;
                      setFile(nextFile);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    PDFs e imagens ate 25MB. Eles serao salvos em
                    study-docs/{userId}.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="upload-notes">Notas</Label>
                  <Textarea
                    id="upload-notes"
                    value={uploadNotes}
                    onChange={(event) => setUploadNotes(event.target.value)}
                    placeholder="Resumo opcional sobre este material..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="upload-visibility">Visibilidade</Label>
                  <select
                    id="upload-visibility"
                    className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
                    value={uploadVisibility}
                    onChange={(event) =>
                      setUploadVisibility(event.target.value as Visibility)
                    }
                  >
                    <option value="private">Privado</option>
                    <option value="class">Turma/Compartilhado</option>
                    <option value="public">Publico</option>
                  </select>
                </div>
                {uploadMessage && (
                  <p className="text-sm text-muted-foreground">{uploadMessage}</p>
                )}
                <Button
                  type="submit"
                  disabled={uploading || !file}
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      Fazer upload
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form
                onSubmit={handleSubmit(async (values) => {
                  await onSubmitLink(values);
                })}
                className="space-y-4"
              >
                <div className="grid gap-2">
                  <Label htmlFor="link-title">Titulo</Label>
                  <Input
                    id="link-title"
                    placeholder="Playlist Osteologia - Semana 1"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="link-url">URL</Label>
                  <Input
                    id="link-url"
                    placeholder="https://..."
                    {...register("url")}
                  />
                  {errors.url && (
                    <p className="text-sm text-destructive">
                      {errors.url.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="link-notes">Notas</Label>
                  <Textarea
                    id="link-notes"
                    placeholder="Resumo ou instrucoes de estudo"
                    {...register("notes")}
                  />
                  {errors.notes && (
                    <p className="text-sm text-destructive">
                      {errors.notes.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="link-visibility">Visibilidade</Label>
                  <select
                    id="link-visibility"
                    className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
                    {...register("visibility")}
                  >
                    <option value="private">Privado</option>
                    <option value="class">Turma/Compartilhado</option>
                    <option value="public">Publico</option>
                  </select>
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar link"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Meus materiais</h2>
            <p className="text-sm text-muted-foreground">
              Gere links assinados para compartilhar arquivos privados com seus
              alunos por uma hora.
            </p>
          </CardHeader>
          <CardContent>
            {contentMessage && (
              <p className="mb-4 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">
                {contentMessage}
              </p>
            )}
            {sources.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum material cadastrado ainda. Faca upload ou adicione um
                link acima.
              </p>
            ) : (
              <div className="space-y-3">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="rounded-2xl border border-border/60 bg-muted/30 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {source.title ?? "Sem titulo"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {source.kind.toUpperCase()} - {source.visibility} -{" "}
                          {source.created_at
                            ? formatDistanceToNow(new Date(source.created_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })
                            : "Data desconhecida"}
                        </p>
                        {source.notes && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {source.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => void handleOpenSource(source)}
                          disabled={signedUrlLoading === source.id}
                          className="whitespace-nowrap"
                        >
                          {signedUrlLoading === source.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Gerando...
                            </>
                          ) : (
                            "Abrir"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void handleIngest(source)}
                      disabled={ingestingId === source.id}
                      className="whitespace-nowrap"
                    >
                      {ingestingId === source.id ? "Enfileirando..." : "Gerar quiz"}
                    </Button>
                    {source.kind === "url" && source.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard?.writeText(source.url ?? "")}
                          >
                            Copiar link
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function requestSignedUrl(path: string) {
  const response = await fetch("/api/storage/signed-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error("Erro ao gerar URL assinada", error);
    return null;
  }

  const { url } = (await response.json()) as { url: string };
  return url;
}
