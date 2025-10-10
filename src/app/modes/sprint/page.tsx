import { SprintMode, type SprintItem } from "@/components/gameplay/sprint-mode";
import { normalizeOptions } from "@/lib/quiz";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Modo Sprint",
};

type SprintItemRow = {
  id: string;
  type: string | null;
  stem: string;
  options: unknown;
  answer: unknown;
  level: {
    title: string;
    module: {
      title: string;
    } | null;
  } | null;
};

export default async function SprintModePage() {
  const supabase = await getServerSupabaseClient();
  const { data: itemsData, error } = await supabase
    .from("quiz_items")
    .select(
      "id, type, stem, options, answer, level:levels!inner(title, module:modules(title))",
    )
    .eq("type", "mcq")
    .limit(50);

  if (error) {
    throw new Error(`Erro ao carregar itens para o sprint: ${error.message}`);
  }

  const parsedItems: SprintItem[] = (itemsData as SprintItemRow[]).map(
    (item) => ({
      id: item.id,
      stem: item.stem,
      options: normalizeOptions(item.options),
      answer: parseAnswer(item.answer),
      moduleTitle: item.level?.module?.title ?? "Geral",
      levelTitle: item.level?.title ?? "Fase",
    }),
  );

  const sprintItems = parsedItems.filter(
    (item) => item.options.length > 0 && item.answer,
  );

  return (
    <div className="flex flex-col gap-6">
      <SprintMode items={sprintItems} />
    </div>
  );
}

function parseAnswer(answer: unknown): string {
  if (typeof answer === "string") return answer;
  if (Array.isArray(answer) && answer.length > 0) {
    const first = answer[0];
    if (typeof first === "string") {
      return first;
    }
  }
  return "";
}
