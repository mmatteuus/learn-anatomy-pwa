"use client";

import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Award,
  Flame,
  Loader2,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import type { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";

type SupabaseBrowserClient = ReturnType<typeof useSupabaseClient<Database>>;

type SprintOption = {
  key: string;
  text: string;
};

export type SprintItem = {
  id: string;
  stem: string;
  options: SprintOption[];
  answer: string;
  moduleTitle: string;
  levelTitle: string;
};

type SprintModeProps = {
  items: SprintItem[];
  durationSeconds?: number;
};

type SprintAttempt = {
  itemId: string;
  correct: boolean;
  timeMs: number;
};

type SprintStatus = "idle" | "running" | "paused" | "finished";

export function SprintMode({
  items,
  durationSeconds = 90,
}: SprintModeProps) {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const [status, setStatus] = useState<SprintStatus>("idle");
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState<SprintAttempt[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartRef = useRef<number>(performance.now());
  const queue = useMemo(() => shuffleArray(items), [items]);
  const currentItem = queue[questionIndex % queue.length];

  useEffect(() => {
    if (status !== "running") {
      clearIntervalIfNeeded();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearIntervalIfNeeded();
          setStatus("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearIntervalIfNeeded;
  }, [status]);

  useEffect(() => {
    if (status === "running") {
      questionStartRef.current = performance.now();
      setSelected(null);
    }
  }, [questionIndex, status]);

  const handleStart = () => {
    setStatus("running");
    setTimeLeft(durationSeconds);
    setQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setAttempts([]);
  };

  const handlePauseToggle = () => {
    setStatus((prev) => (prev === "running" ? "paused" : "running"));
  };

  const handleSubmit = async () => {
    if (!currentItem || selected === null || status !== "running") {
      return;
    }
    setProcessing(true);

    const correct = selected === currentItem.answer;
    const timeMs = Math.round(performance.now() - questionStartRef.current);
    const nextStreak = correct ? streak + 1 : 0;
    const pointsEarned = correct ? 100 + nextStreak * 20 : 0;

    setStreak(nextStreak);
    setScore((prev) => prev + pointsEarned);
    setAttempts((prev) => [...prev, { itemId: currentItem.id, correct, timeMs }]);

    if (session?.user) {
      await registerSprintAttempt({
        attempt: { correct, timeMs, quizItemId: currentItem.id },
        supabase,
      });
    }

    setSelected(null);
    setQuestionIndex((prev) => prev + 1);
    questionStartRef.current = performance.now();
    setProcessing(false);
  };

  const handleRestart = () => {
    setStatus("idle");
    setTimeLeft(durationSeconds);
    setQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setAttempts([]);
  };

  if (queue.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Adicione pelo menos um item MCQ para liberar o modo Sprint.
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Sessao Sprint
          </p>
          <h1 className="text-3xl font-bold">Sprint cronometrado</h1>
          <p className="text-sm text-muted-foreground">
            Responda o máximo de itens em {durationSeconds} segundos. Acertos
            consecutivos aumentam seu multiplicador de pontos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ScoreBadge label="Pontuacao" value={score} icon={<Award className="h-4 w-4" />} />
          <ScoreBadge label="Streak" value={streak} icon={<Flame className="h-4 w-4" />} />
          <ScoreBadge
            label="Tempo"
            value={`${timeLeft}s`}
            variant={timeLeft < 10 ? "warning" : "default"}
          />
        </div>
      </header>

      {status === "idle" && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Itens disponiveis: {queue.length}. Cada acerto vale pelo menos 100
            pontos, mais um bonus de 20 pontos por streak.
          </p>
          <Button onClick={handleStart} className="h-11 px-8 text-base font-semibold">
            Iniciar Sprint
          </Button>
        </div>
      )}

      {status === "running" && currentItem && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
            <span>{currentItem.moduleTitle}</span>
            <span>{currentItem.levelTitle}</span>
          </div>
          <h2 className="text-xl font-semibold">{currentItem.stem}</h2>
          <div className="space-y-3">
            {currentItem.options.map((option) => {
              const isSelected = selected === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setSelected(option.key)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/60"
                  }`}
                >
                  <span className="font-semibold">{option.key})</span>{" "}
                  {option.text}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePauseToggle}
              className="flex items-center gap-2"
            >
              {status === "running" ? (
                <>
                  <Pause className="h-4 w-4" aria-hidden="true" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Retomar
                </>
              )}
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={selected === null || processing}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Responder"
              )}
            </Button>
          </div>
        </div>
      )}

      {status === "paused" && (
        <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          Sprint pausada. Aproveite para respirar e retome quando estiver pronto.
        </div>
      )}

      {status === "finished" && (
        <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-6">
          <h2 className="text-xl font-semibold">Resumo da sessão</h2>
          <div className="grid gap-3 text-sm text-muted-foreground">
            <p>
              Pontuacao final: <span className="font-semibold text-foreground">{score}</span>
            </p>
            <p>
              Corretas:{" "}
              <span className="font-semibold text-foreground">
                {attempts.filter((attempt) => attempt.correct).length}
              </span>{" "}
              de {attempts.length} itens.
            </p>
            <p>
              Melhor streak:{" "}
              <span className="font-semibold text-foreground">
                {calculateBestStreak(attempts)}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRestart}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reiniciar
            </Button>
            <Button onClick={handleStart} className="flex items-center gap-2">
              <Play className="h-4 w-4" aria-hidden="true" />
              Nova Sprint
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  function clearIntervalIfNeeded() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function calculateBestStreak(attempts: SprintAttempt[]) {
  let longest = 0;
  let current = 0;
  for (const attempt of attempts) {
    if (attempt.correct) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}

function ScoreBadge({
  label,
  value,
  icon,
  variant = "default",
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  variant?: "default" | "warning";
}) {
  const baseClass =
    "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold";
  const variantClass =
    variant === "warning"
      ? "border-amber-500 bg-amber-500/10 text-amber-600"
      : "border-border bg-muted/40 text-foreground";

  return (
    <span className={`${baseClass} ${variantClass}`}>
      {icon}
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </span>
  );
}

async function registerSprintAttempt({
  attempt,
  supabase,
}: {
  attempt: { quizItemId: string; correct: boolean; timeMs: number };
  supabase: SupabaseBrowserClient;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("attempts").insert({
    quiz_item_id: attempt.quizItemId,
    correct: attempt.correct,
    time_ms: attempt.timeMs,
    confidence: 3,
  });

  if (error) {
    console.error("Falha ao registrar tentativa do sprint:", error.message);
  }
}
