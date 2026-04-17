export interface ParsedStrings {
  strings: string[];
  error: string | null;
}

export function parseStrings(raw: string): ParsedStrings {
  const tokens = raw
    .split(/[,\n\r\t;]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const token of tokens) {
    const key = token.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(token);
  }
  if (unique.length < 4) {
    return {
      strings: unique,
      error: "Podaj co najmniej 4 różne ciągi znaków (rozdzielone przecinkami).",
    };
  }
  return { strings: unique, error: null };
}
