"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Loader2 } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signInSchema = z.object({
  email: z.string().email("Informe um email válido"),
  password: z
    .string()
    .min(8, "A senha precisa ter pelo menos 8 caracteres"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

type Props = {
  redirectTo?: string;
  defaultEmail?: string;
};

export function SignInForm({ redirectTo = "/play", defaultEmail }: Props) {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: defaultEmail ?? "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      const fallback =
        error.message === "Invalid login credentials"
          ? "Email ou senha incorretos."
          : error.message;
      setErrorMessage(fallback);
      setFocus("password");
      return;
    }

    setSuccessMessage("Autenticação realizada. Redirecionando...");
    router.push((redirectTo || "/play") as Route);
    router.refresh();
  };

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="voce@email.com"
          autoCapitalize="none"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      {errorMessage && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-xl border border-secondary/60 bg-secondary/20 px-4 py-3 text-sm text-foreground">
          {successMessage}
        </div>
      )}
      <Button type="submit" disabled={isSubmitting} className="h-11">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
}
