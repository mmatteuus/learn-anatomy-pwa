"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function ThemeProvider({ children }: Props) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="jganatomia-theme"
      enableColorScheme
      themes={["light", "dark", "high-contrast"]}
    >
      {children}
    </NextThemesProvider>
  );
}
