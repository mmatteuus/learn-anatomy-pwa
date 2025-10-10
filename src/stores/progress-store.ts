import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AttemptSnapshot = {
  id: string;
  quizItemId: string;
  correct: boolean;
  confidence: number;
  timeMs: number;
  createdAt: number;
  synced: boolean;
};

export type LevelSnapshot = {
  levelId: string;
  answered: Record<string, AttemptSnapshot>;
  history: AttemptSnapshot[];
  bestScore: number;
  completed: boolean;
};

type ProgressState = {
  levels: Record<string, LevelSnapshot>;
};

type ProgressActions = {
  recordAttempt: (
    levelId: string,
    totalItems: number,
    payload: Omit<AttemptSnapshot, "id" | "createdAt" | "synced">,
  ) => AttemptSnapshot;
  markAttemptsSynced: (levelId: string, attemptIds: string[]) => void;
  resetLevel: (levelId: string) => void;
};

const createEmptySnapshot = (levelId: string): LevelSnapshot => ({
  levelId,
  answered: {},
  history: [],
  bestScore: 0,
  completed: false,
});

export const useProgressStore = create<ProgressState & ProgressActions>()(
  persist(
    (set) => ({
      levels: {},
      recordAttempt: (levelId, totalItems, payload) => {
        const attemptId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;

        const snapshot: AttemptSnapshot = {
          id: attemptId,
          createdAt: Date.now(),
          synced: false,
          ...payload,
        };

        set((state) => {
          const level = state.levels[levelId]
            ? { ...state.levels[levelId] }
            : createEmptySnapshot(levelId);

          const answered = { ...level.answered };
          answered[payload.quizItemId] = snapshot;

          const history = [...level.history, snapshot];
          const correctCount = Object.values(answered).filter(
            (item) => item.correct,
          ).length;

          const updatedLevel: LevelSnapshot = {
            levelId,
            answered,
            history,
            bestScore: Math.max(level.bestScore, correctCount),
            completed: correctCount >= totalItems,
          };

          return {
            levels: {
              ...state.levels,
              [levelId]: updatedLevel,
            },
          };
        });

        return snapshot;
      },
      markAttemptsSynced: (levelId, attemptIds) => {
        if (attemptIds.length === 0) return;
        set((state) => {
          const current = state.levels[levelId];
          if (!current) return state;

          const attemptsSet = new Set(attemptIds);
          const history = current.history.map((attempt) =>
            attemptsSet.has(attempt.id)
              ? { ...attempt, synced: true }
              : attempt,
          );

          // Update answered references to keep synced flag up to date
          const answeredEntries = Object.entries(current.answered).map(
            ([key, value]) => [
              key,
              attemptsSet.has(value.id) ? { ...value, synced: true } : value,
            ],
          );

          const updatedLevel: LevelSnapshot = {
            ...current,
            history,
            answered: Object.fromEntries(answeredEntries),
          };

          return {
            levels: {
              ...state.levels,
              [levelId]: updatedLevel,
            },
          };
        });
      },
      resetLevel: (levelId) => {
        set((state) => {
          const levels = { ...state.levels };
          delete levels[levelId];
          return { levels };
        });
      },
    }),
    {
      name: "jganatomia-progress",
      version: 1,
    },
  ),
);

export const getLevelSnapshot = (levelId: string) =>
  useProgressStore.getState().levels[levelId];
