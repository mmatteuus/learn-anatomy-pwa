"use client";

import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";

type Status = "loading" | "success" | "error";

export default function ConfirmPage() {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") ?? "/play";
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string>("Validando link de acesso...");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setStatus("error");
      setMessage("Código inválido. Solicite um novo link de acesso.");
      return;
    }

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }
        setStatus("success");
        setMessage("Tudo certo! Redirecionando para sua campanha...");
        setTimeout(() => {
          router.replace(redirectUrl as Route);
          router.refresh();
        }, 1500);
      })
      .catch((err: Error) => {
        setStatus("error");
        setMessage(err.message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectUrl, supabase, searchParams]);

  const icon =
    status === "loading" ? (
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    ) : status === "success" ? (
      <CheckCircle2 className="h-12 w-12 text-emerald-500" />
    ) : (
      <XCircle className="h-12 w-12 text-destructive" />
    );

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-6 rounded-3xl border border-border bg-card p-10 text-center shadow-xl">
      {icon}
      <h1 className="text-2xl font-semibold">
        {status === "success"
          ? "Sessão confirmada"
          : status === "error"
            ? "Não foi possível validar"
            : "Conectando..."}
      </h1>
      <p className="text-sm text-muted-foreground">{message}</p>
      {status === "error" && (
        <Button onClick={() => router.push("/auth/sign-in")} size="md">
          Voltar para login
        </Button>
      )}
    </div>
  );
}
