"use client";

import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2, RefreshCcw, Sparkles, XCircle } from "lucide-react";
import type { Database } from "@/types/supabase";
import {
  getLevelSnapshot,
  useProgressStore,
  type AttemptSnapshot,
} from "@/stores/progress-store";
import { Button } from "@/components/ui/button";

type QuizOption = {
  key: string;
  text: string;
};

type SupabaseBrowserClient = ReturnType<typeof useSupabaseClient<Database>>;

export type QuizItem = {
  id: string;
  type: "mcq" | "hotspot" | "label";
  stem: string;
  options: QuizOption[];
  answer: unknown;
  explanation: string | null;
  difficulty: number | null;
};

type QuizEngineProps = {
  levelId: string;
  moduleTitle: string;
  items: QuizItem[];
  isDemo: boolean;
};

type FeedbackState = {
  correct: boolean;
  selectedOption?: string;
  answer?: string;
  explanation?: string | null;
};

const confidenceValues = [1, 2, 3, 4, 5];

export function QuizEngine({
  levelId,
  moduleTitle,
  items,
  isDemo,
}: QuizEngineProps) {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const recordAttempt = useProgressStore((state) => state.recordAttempt);
  const markAttemptsSynced = useProgressStore(
    (state) => state.markAttemptsSynced,
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(3);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const questionStartRef = useRef<number>(performance.now());

  const currentItem = items[currentIndex];
  const levelProgress = useProgressStore(
    (state) => state.levels[levelId],
  );
  const answeredCount = useMemo(() => {
    if (!levelProgress) return 0;
    return Object.values(levelProgress.answered).filter(
      (item) => item.correct,
    ).length;
  }, [levelProgress]);

  useEffect(() => {
    questionStartRef.current = performance.now();
    setSelectedOption(null);
    setFeedback(null);
    setConfidence(3);
  }, [currentIndex]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [levelId]);

  const handleSubmit = async () => {
    if (!currentItem) return;
    if (currentItem.type === "mcq" && !selectedOption) {
      setFeedback({
        correct: false,
        explanation: "Selecione uma alternativa para continuar.",
        });
      return;
    }

    setSubmitting(true);
    const timeMs = Math.round(performance.now() - questionStartRef.current);
    const correct =
      currentItem.type === "mcq"
        ? selectedOption === (currentItem.answer as string)
        : false;

    const attempt = recordAttempt(levelId, items.length, {
      quizItemId: currentItem.id,
      correct,
      confidence,
      timeMs,
    });

    if (session?.user) {
      await syncAttemptWithSupabase({ attempt, supabase, levelId });
    }

    const snapshot = getLevelSnapshot(levelId);
    if (session?.user && snapshot) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("user_progress")
        .upsert({
          user_id: session.user.id,
          level_id: levelId,
          best_score: snapshot.bestScore,
          completed: snapshot.completed,
          last_played: new Date().toISOString(),
        });
    }

    setFeedback({
      correct,
      selectedOption: currentItem.type === "mcq" ? selectedOption ?? undefined : undefined,
      answer: currentItem.type === "mcq" ? String(currentItem.answer) : undefined,
      explanation: currentItem.explanation,
    });
    setSubmitting(false);
  };

  const handleNext = () => {
    const next = currentIndex + 1;
    if (next >= items.length) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(next);
    }
    questionStartRef.current = performance.now();
  };

  const progressSummary = levelProgress
    ? {
        bestScore: levelProgress.bestScore,
        completed: levelProgress.completed,
      }
    : { bestScore: 0, completed: false };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {moduleTitle}
          </p>
          <h2 className="text-2xl font-semibold">
            {currentItem?.stem ?? "Sem itens cadastrados"}
          </h2>
        </header>

        {currentItem ? (
          <>
            {currentItem.type === "mcq" ? (
              <div className="space-y-3">
                {currentItem.options.map((option) => {
                  const isSelected = selectedOption === option.key;
                  const showAsCorrect =
                    feedback &&
                    feedback.correct &&
                    feedback.selectedOption === option.key;
                  const showAsAnswer =
                    feedback &&
                    !feedback.correct &&
                    feedback.answer === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setSelectedOption(option.key)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/60"
                      } ${
                        showAsCorrect
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                          : ""
                      } ${
                        showAsAnswer
                          ? "border-primary bg-primary/15 text-primary"
                          : ""
                      }`}
                    >
                      <span className="font-semibold">{option.key})</span>{" "}
                      {option.text}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/40 p-6 text-sm text-muted-foreground">
                O tipo de item <strong>{currentItem.type}</strong> ainda nao
                possui renderer interativo. Ele sera habilitado nas proximas
                iteracoes.
              </div>
            )}

            <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Nivel de confianca na resposta
                </p>
                <div className="mt-2 flex gap-2">
                  {confidenceValues.map((value) => {
                    const active = value === confidence;
                    return (
                      <button
                        key={value}
                        type="button"
                        className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/60"
                        }`}
                        onClick={() => setConfidence(value)}
                        aria-pressed={active}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {isDemo
                    ? "Demo aberta a convidados"
                    : "Requer autenticação"}
                </span>
                <Button
                  onClick={() => void handleSubmit()}
                  disabled={submitting || !currentItem}
                >
                  {submitting ? (
                    <>
                      <Loader2
                        className="mr-2 h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      Enviando...
                    </>
                  ) : (
                    "Confirmar resposta"
                  )}
                </Button>
              </div>
            </div>

            {feedback && (
              <div className="space-y-2 rounded-2xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 font-semibold">
                  {feedback.correct ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span>Resposta correta!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-destructive" />
                      <span>Resposta incorreta.</span>
                    </>
                  )}
                </div>
                {feedback.explanation && (
                  <p className="text-sm text-muted-foreground">
                    {feedback.explanation}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={handleNext}
                  >
                    <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                    Seguinte
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.refresh()}
                  >
                    Atualizar fase
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
            Nenhum item cadastrado para esta fase ainda.
          </p>
        )}
      </div>

      <aside className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Progresso</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Itens corretos</span>
            <span className="font-semibold">
              {answeredCount}/{items.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Melhor pontuacao</span>
            <span className="font-semibold">
              {progressSummary.bestScore}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Status</span>
            <span className="font-semibold text-primary">
              {progressSummary.completed ? (
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Concluida
                </span>
              ) : (
                "Em progresso"
              )}
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-xs text-muted-foreground">
          As respostas certas ficam salvas localmente quando voce joga como
          convidado. Ao fazer login, seu progresso e tentativas serao
          sincronizados automaticamente com sua conta.
        </div>
      </aside>
    </div>
  );

  async function syncAttemptWithSupabase({
    attempt,
    supabase,
    levelId: currentLevelId,
  }: {
    attempt: AttemptSnapshot;
    supabase: SupabaseBrowserClient;
    levelId: string;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("attempts").insert({
      user_id: session?.user?.id,
      quiz_item_id: attempt.quizItemId,
      correct: attempt.correct,
      confidence: attempt.confidence,
      time_ms: attempt.timeMs,
    });

    if (!error) {
      markAttemptsSynced(currentLevelId, [attempt.id]);
    }
  }
}
