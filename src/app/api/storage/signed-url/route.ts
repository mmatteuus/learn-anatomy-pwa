import { NextResponse } from "next/server";
import { getServerSupabaseClient, getServiceRoleSupabaseClient } from "@/lib/supabase/server";

type SignedUrlPayload = {
  path?: string;
};

export async function POST(request: Request) {
  const supabase = await getServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const payload = (await request.json()) as SignedUrlPayload;
  const path = payload.path;

  if (!path || typeof path !== "string") {
    return NextResponse.json({ error: "Path inválido" }, { status: 400 });
  }

  if (!path.startsWith(`${session.user.id}/`)) {
    return NextResponse.json({ error: "Sem permissao para este arquivo" }, { status: 403 });
  }

  const serviceClient = getServiceRoleSupabaseClient();
  const { data, error } = await serviceClient.storage
    .from("study-docs")
    .createSignedUrl(path, 60 * 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: error?.message ?? "Nao foi possivel gerar link" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: data.signedUrl });
}
