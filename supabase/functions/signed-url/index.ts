// @ts-nocheck
// Deno edge function para gerar Signed URLs de study-docs/<user>/<arquivo>.
// Necessita que a secret SUPABASE_SERVICE_ROLE_KEY esteja registrada no projeto Supabase.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const { path, expiresIn = 3600 } = await req.json();
    if (!path || typeof path !== "string") {
      return new Response(JSON.stringify({ error: "path inválido" }), {
        status: 400,
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "não autenticado" }), {
        status: 401,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRole) {
      return new Response(
        JSON.stringify({
          error: "Configuração do edge function incompleta",
        }),
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRole);

    // Recupera o usuário autenticado a partir do token JWT recebido.
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "token inválido" }), {
        status: 401,
      });
    }

    if (!path.startsWith(`${user.id}/`)) {
      return new Response(
        JSON.stringify({ error: "o arquivo não pertence ao usuário" }),
        { status: 403 },
      );
    }

    const { data, error } = await supabase.storage
      .from("study-docs")
      .createSignedUrl(path, expiresIn);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ url: data?.signedUrl }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Erro desconhecido",
      }),
      { status: 500 },
    );
  }
});
