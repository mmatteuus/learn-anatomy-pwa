import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ColorBlindMode =
  | "none"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "friendly";

type AccessibilityState = {
  highContrast: boolean;
  colorBlindMode: ColorBlindMode;
  reduceMotion: boolean;
};

type AccessibilityActions = {
  toggleHighContrast: () => void;
  setColorBlindMode: (mode: ColorBlindMode) => void;
  setReduceMotion: (value: boolean) => void;
  resetAccessibility: () => void;
};

const initialState: AccessibilityState = {
  highContrast: false,
  colorBlindMode: "none",
  reduceMotion: false,
};

export const useAccessibilityStore = create<
  AccessibilityState & AccessibilityActions
>()(
  persist(
    (set) => ({
      ...initialState,
      toggleHighContrast: () =>
        set((state) => ({ highContrast: !state.highContrast })),
      setColorBlindMode: (colorBlindMode) => set({ colorBlindMode }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      resetAccessibility: () => set(initialState),
    }),
    {
      name: "jganatomia-a11y",
      version: 1,
    },
  ),
);
