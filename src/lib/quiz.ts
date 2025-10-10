export type NormalizedOption = {
  key: string;
  text: string;
};

export function normalizeOptions(raw: unknown): NormalizedOption[] {
  if (!raw) return [];

  const parsed =
    typeof raw === "string"
      ? safeParseJSON(raw)
      : Array.isArray(raw)
        ? raw
        : [];

  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((option) => ({
      key: typeof option?.key === "string" ? option.key : "",
      text: typeof option?.text === "string" ? option.text : "",
    }))
    .filter((option) => option.key && option.text);
}

function safeParseJSON(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}
