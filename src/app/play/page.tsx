import Link from "next/link";
import type { Route } from "next";
import { Lock } from "lucide-react";
import { getServerSupabaseClient } from "@/lib/supabase/server";

type LevelPreview = {
  id: string;
  idx: number;
  title: string;
  is_demo: boolean | null;
};

type ModulePreview = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  levels: LevelPreview[];
};

export const metadata = {
  title: "Campanha",
};

export default async function PlayHubPage() {
  const supabase = await getServerSupabaseClient();
  const [{ data: sessionData }, { data: modulesData, error }] =
    await Promise.all([
      supabase.auth.getSession(),
      supabase
        .from("modules")
        .select(
          "id, slug, title, description, levels(id, idx, title, is_demo)",
        )
        .order("title", { ascending: true })
        .order("idx", { referencedTable: "levels", ascending: true }),
    ]);

  if (error) {
    throw new Error(`Falha ao carregar modulos: ${error.message}`);
  }

  const modules: ModulePreview[] = (modulesData ?? []).map((module) => ({
    id: module.id,
    slug: module.slug,
    title: module.title,
    description: module.description,
    levels: (module.levels ?? []) as LevelPreview[],
  }));

  const session = sessionData.session;

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Campanha por sistemas</h1>
        <p className="text-muted-foreground">
          Explore um sistema por vez, desbloqueando fases e chefes conforme
          registra seu progresso. A fase demo fica aberta sem login; a partir da
          fase 2, é preciso estar autenticado.
        </p>
      </header>

      <div className="grid gap-6">
        {modules.map((module) => (
          <article
            key={module.id}
            className="rounded-3xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{module.title}</h2>
              {module.description && (
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
              )}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {module.levels.map((level) => {
                const locked = !session && !level.is_demo;
                const levelHref = `/play/module/${module.slug}/level/${level.idx}` as Route;
                const href = locked
                  ? {
                      pathname: "/auth/sign-in",
                      query: {
                        redirect: levelHref,
                        reason: "level-locked",
                      },
                    }
                  : levelHref;

                return (
                  <div
                    key={level.id}
                    className="flex flex-col justify-between rounded-2xl border border-border/80 bg-background p-4 shadow-sm"
                    aria-live="polite"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                          Level {level.idx}
                        </span>
                        {!level.is_demo && (
                          <span className="text-xs text-muted-foreground">
                            Login requerido
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold">{level.title}</h3>
                    </div>
                    <Link
                      href={href}
                      className="mt-4 inline-flex items-center justify-between rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                    >
                      {locked ? "Fazer login" : "Jogar agora"}
                      {locked && <Lock className="ml-2 h-4 w-4" aria-hidden />}
                    </Link>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
