import type { Language } from "../types";

export interface SpokenTextOptions {
  text: string;
  lang: Language;
  repeatCount?: number;
}

export interface SpokenText {
  text: string;
  rate: number;
  wasExpanded: boolean;
}

const DEFAULT_REPEAT_COUNT = 3;
const POLISH_SHORT_SYLLABLE_MAX_LENGTH = 3;
const ENGLISH_SHORT_SYLLABLE_MAX_LENGTH = 2;
const SHORT_SYLLABLE_RATE = 0.75;
const DEFAULT_RATE = 0.9;
const LETTER_PATTERN = /^\p{L}+$/u;

function shouldExpand(text: string, lang: Language): boolean {
  if (!LETTER_PATTERN.test(text)) return false;
  const threshold =
    lang === "polish"
      ? POLISH_SHORT_SYLLABLE_MAX_LENGTH
      : ENGLISH_SHORT_SYLLABLE_MAX_LENGTH;
  return [...text].length <= threshold;
}

export function renderSpokenText({
  text,
  lang,
  repeatCount = DEFAULT_REPEAT_COUNT,
}: SpokenTextOptions): SpokenText {
  const trimmed = text.trim();
  if (!trimmed) {
    return { text: trimmed, rate: DEFAULT_RATE, wasExpanded: false };
  }
  if (!shouldExpand(trimmed, lang)) {
    return { text: trimmed, rate: DEFAULT_RATE, wasExpanded: false };
  }
  const safeRepeat = Math.max(2, repeatCount);
  const expanded = Array(safeRepeat).fill(trimmed).join(", ");
  return { text: expanded, rate: SHORT_SYLLABLE_RATE, wasExpanded: true };
}
