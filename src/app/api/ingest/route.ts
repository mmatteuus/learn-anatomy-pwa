import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/server";

type IngestPayload = {
  sourceId?: string;
  type: "url" | "pdf" | "image";
};

export async function POST(request: Request) {
  const supabase = await getServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const payload = (await request.json()) as IngestPayload;
  if (!payload?.sourceId) {
    return NextResponse.json({ error: "sourceId obrigatório" }, { status: 400 });
  }

  // Placeholder: aqui integraríamos com uma fila ou edge function que extrai o conteúdo.
  console.info("Ingest job recebido", payload);

  return NextResponse.json(
    {
      status: "queued",
      sourceId: payload.sourceId,
    },
    { status: 202 },
  );
}
