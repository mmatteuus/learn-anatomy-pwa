import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { QuizEngine, type QuizItem } from "@/components/gameplay/quiz-engine";
import { normalizeOptions } from "@/lib/quiz";
import { getServerSupabaseClient } from "@/lib/supabase/server";

type ParamsPromise = Promise<{
  slug: string;
  idx: string;
}>;

export default async function LevelPage({
  params,
}: {
  params: ParamsPromise;
}) {
  const { slug, idx } = await params;
  const levelIndex = Number.parseInt(idx, 10);
  if (!Number.isFinite(levelIndex)) {
    notFound();
  }

  const supabase = await getServerSupabaseClient();
  const [
    { data: sessionData },
    { data: moduleData, error: moduleError },
  ] = await Promise.all([
    supabase.auth.getSession(),
    supabase
      .from("modules")
      .select("id, title, description")
      .eq("slug", slug)
      .maybeSingle(),
  ]);

  if (moduleError) {
    throw new Error(`Erro ao carregar modulo: ${moduleError.message}`);
  }

  if (!moduleData) {
    notFound();
  }

  const { data: levelData, error: levelError } = await supabase
    .from("levels")
    .select("id, idx, title, is_demo")
    .eq("module_id", moduleData.id)
    .eq("idx", levelIndex)
    .maybeSingle();

  if (levelError) {
    throw new Error(`Erro ao carregar nivel: ${levelError.message}`);
  }

  if (!levelData) {
    notFound();
  }

  const {
    data: quizItems,
    error: quizError,
  } = await supabase
    .from("quiz_items")
    .select(
      "id, type, stem, options, answer, explanation, tags, difficulty",
    )
    .eq("level_id", levelData.id)
    .order("difficulty", { ascending: true });

  if (quizError) {
    throw new Error(`Erro ao carregar itens da fase: ${quizError.message}`);
  }

  const session = sessionData.session;
  const locked = !levelData.is_demo && !session;
  if (locked) {
    const redirectUrl = `/play/module/${slug}/level/${levelIndex}`;
    redirect(
      `/auth/sign-in?redirect=${encodeURIComponent(redirectUrl)}&reason=level-locked`,
    );
  }

  const normalizedItems: QuizItem[] = (quizItems ?? []).map((item) => ({
    id: item.id,
    type: (item.type ?? "mcq") as QuizItem["type"],
    stem: item.stem,
    options: normalizeOptions(item.options),
    answer: item.answer,
    explanation: item.explanation,
    difficulty: item.difficulty,
  }));

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div className="flex items-center gap-3">
        <Link
          href="/play"
          className="inline-flex items-center text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Voltar para campanha
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          {moduleData.title}
        </p>
        <h1 className="text-3xl font-bold">{levelData.title}</h1>
        {moduleData.description && (
          <p className="text-sm text-muted-foreground">
            {moduleData.description}
          </p>
        )}
      </header>

      <QuizEngine
        levelId={levelData.id}
        moduleTitle={moduleData.title}
        items={normalizedItems}
        isDemo={Boolean(levelData.is_demo)}
      />
    </div>
  );
}
