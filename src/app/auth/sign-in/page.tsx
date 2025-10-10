import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata = {
  title: "Entrar | JGAnatomia",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function buildRedirect(param: string | string[] | undefined) {
  if (!param) return "/play";
  return Array.isArray(param) ? param[0] ?? "/play" : param;
}

function buildMessage(reason: string | string[] | undefined) {
  if (!reason) return null;
  const value = Array.isArray(reason) ? reason[0] : reason;
  switch (value) {
    case "level-locked":
      return "Faça login para desbloquear fases avançadas e salvar seu progresso.";
    case "content":
      return "É preciso estar autenticado para gerenciar conteúdos e playlists.";
    default:
      return null;
  }
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const redirectTo = buildRedirect(params.redirect);
  const reasonMessage = buildMessage(params.reason);
  const emailPrefill =
    typeof params.email === "string" ? params.email : undefined;

  return (
    <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_1fr]">
      <Card className="backdrop-blur">
        <CardHeader className="space-y-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Entrar</h1>
            <p className="text-sm text-muted-foreground">
              Acesse fases avançadas, salve progresso e acompanhe analytics.
            </p>
          </div>
          {reasonMessage && (
            <p className="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
              {reasonMessage}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <SignInForm redirectTo={redirectTo} defaultEmail={emailPrefill} />
          <div className="mt-6 text-sm text-muted-foreground">
            Esqueceu a senha?{" "}
            <Link
              href="https://app.supabase.com"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Entre em contato com o suporte
            </Link>
            .
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed backdrop-blur-sm">
        <CardHeader className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Criar conta</h2>
            <p className="text-sm text-muted-foreground">
              Monte playlists customizadas, acompanhe tentativas e convide sua
              turma.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={null}>
            <SignUpForm redirectTo={redirectTo} />
          </Suspense>
          <p className="mt-6 text-xs text-muted-foreground">
            Ao continuar você concorda com os termos educacionais do projeto.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
