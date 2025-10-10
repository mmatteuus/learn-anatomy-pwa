import { redirect } from "next/navigation";
import { ContentManager, type ContentSource } from "@/components/content/content-manager";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Conteudo plugavel",
};

export default async function ContentHubPage() {
  const supabase = await getServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/sign-in?redirect=/content&reason=content");
  }

  const { data, error } = await supabase
    .from("content_sources")
    .select(
      "id, kind, title, url, storage_path, notes, visibility, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Erro ao carregar materiais: ${error.message}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Biblioteca de estudo</h1>
        <p className="text-muted-foreground">
          Centralize materiais da turma, gere links assinados e dispare ingestao
          de quizzes a partir de PDFs, imagens ou recursos externos.
        </p>
      </header>
      <ContentManager initialSources={(data ?? []) as ContentSource[]} />
    </div>
  );
}
