"use client";

import { useEffect, type ReactNode } from "react";
import { useAccessibilityStore } from "@/stores/accessibility-store";

type Props = {
  children: ReactNode;
};

const COLORBLIND_CLASS_MAP = {
  none: "",
  protanopia: "colorblind-protanopia",
  deuteranopia: "colorblind-deuteranopia",
  tritanopia: "colorblind-tritanopia",
  friendly: "colorblind-friendly",
} satisfies Record<string, string>;

export function AccessibilityProvider({ children }: Props) {
  const highContrast = useAccessibilityStore((state) => state.highContrast);
  const colorBlindMode = useAccessibilityStore((state) => state.colorBlindMode);
  const reduceMotion = useAccessibilityStore((state) => state.reduceMotion);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("high-contrast", highContrast);

    Object.values(COLORBLIND_CLASS_MAP).forEach((className) => {
      if (className) {
        root.classList.remove(className);
      }
    });

    const nextClass = COLORBLIND_CLASS_MAP[colorBlindMode];
    if (nextClass) {
      root.classList.add(nextClass);
    }
  }, [highContrast, colorBlindMode]);

  useEffect(() => {
    const root = document.documentElement;
    if (reduceMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
  }, [reduceMotion]);

  return <>{children}</>;
}
