"use client";

import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";

type Props = {
  className?: string;
};

export function SignOutButton({ className }: Props) {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
    setLoading(false);
  };

  return (
    <Button
      onClick={handleSignOut}
      variant="ghost"
      className={className}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          Saindo...
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Sair
        </>
      )}
    </Button>
  );
}
