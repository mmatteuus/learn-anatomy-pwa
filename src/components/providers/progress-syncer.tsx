"use client";

import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useEffect } from "react";
import type { Database } from "@/types/supabase";
import { useProgressStore } from "@/stores/progress-store";

export function ProgressSyncer() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();

  useEffect(() => {
    const user = session?.user;
    if (!user) {
      return;
    }

    const sync = async () => {
      const levels = useProgressStore.getState().levels;
      const levelEntries = Object.values(levels);

      for (const level of levelEntries) {
        if (!level) continue;

        // Evita gravar dados vazios
        if (level.bestScore === 0 && !level.completed && level.history.length === 0) {
          continue;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("user_progress").upsert({
          user_id: user.id,
          level_id: level.levelId,
          best_score: level.bestScore,
          completed: level.completed,
          last_played: new Date().toISOString(),
        });

        const pendingAttempts = level.history.filter((attempt) => !attempt.synced);
        if (pendingAttempts.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from("attempts").insert(
            pendingAttempts.map((attempt) => ({
              user_id: user.id,
              quiz_item_id: attempt.quizItemId,
              correct: attempt.correct,
              time_ms: attempt.timeMs,
              confidence: attempt.confidence,
            })),
          );

          if (!error) {
            useProgressStore.getState().markAttemptsSynced(
              level.levelId,
              pendingAttempts.map((attempt) => attempt.id),
            );
          }
        }
      }
    };

    sync().catch((err) => {
      console.error("Erro ao sincronizar progresso local:", err);
    });
  }, [session, supabase]);

  return null;
}
