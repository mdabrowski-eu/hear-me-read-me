export function pickRandom<T>(items: readonly T[]): T {
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRandomExcept<T>(items: readonly T[], exclude: T): T {
  if (items.length <= 1) {
    return items[0];
  }
  let candidate = pickRandom(items);
  while (candidate === exclude) {
    candidate = pickRandom(items);
  }
  return candidate;
}

export function sampleDistinct<T>(
  items: readonly T[],
  count: number,
  required: T,
): T[] {
  const pool = items.filter((item) => item !== required);
  const shuffled = shuffle(pool).slice(0, Math.max(0, count - 1));
  return shuffle([required, ...shuffled]);
}
