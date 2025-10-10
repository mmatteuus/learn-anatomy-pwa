"use client";

import type { Session } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { AccessibilityProvider } from "@/components/providers/accessibility-provider";
import { ProgressSyncer } from "@/components/providers/progress-syncer";
import { QueryProvider } from "@/components/providers/query-provider";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

type Props = {
  children: ReactNode;
  initialSession: Session | null;
};

export function AppProviders({ children, initialSession }: Props) {
  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <SupabaseProvider initialSession={initialSession}>
          <QueryProvider>
            <ProgressSyncer />
            {children}
          </QueryProvider>
        </SupabaseProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}
