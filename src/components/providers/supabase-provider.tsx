"use client";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import type { Session } from "@supabase/supabase-js";
import { useMemo, type ReactNode } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

type Props = {
  children: ReactNode;
  initialSession: Session | null;
};

export function SupabaseProvider({ children, initialSession }: Props) {
  const supabase = useMemo(() => getBrowserSupabaseClient(), []);

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={initialSession ?? undefined}
    >
      {children}
    </SessionContextProvider>
  );
}
