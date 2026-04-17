const DIACRITIC_MAP: Record<string, string> = {
  ą: "a",
  ć: "c",
  ę: "e",
  ł: "l",
  ń: "n",
  ó: "o",
  ś: "s",
  ź: "z",
  ż: "z",
};

function normalize(value: string): string {
  const lowered = value.trim().toLowerCase();
  let normalized = "";
  for (const char of lowered) {
    normalized += DIACRITIC_MAP[char] ?? char;
  }
  return normalized
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function transcriptMatches(
  transcripts: readonly string[],
  target: string,
): boolean {
  const normalizedTarget = normalize(target);
  if (!normalizedTarget) return false;
  return transcripts.some((candidate) => {
    const normalizedCandidate = normalize(candidate);
    if (!normalizedCandidate) return false;
    if (normalizedCandidate === normalizedTarget) return true;
    const tokens = normalizedCandidate.split(" ");
    if (tokens.includes(normalizedTarget)) return true;
    const collapsed = normalizedCandidate.replace(/\s+/g, "");
    return collapsed === normalizedTarget;
  });
}
