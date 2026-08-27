import {
  MIN_KEY_ATTEMPTS,
  PRACTICE_EXPLORE_WEIGHT,
  WEAK_KEY_TAKE_MAX,
  WEAK_KEY_TAKE_MIN,
} from "./thresholds";

export interface RankedKey {
  key: string;
  attempts: number;
  mastery: number;
}

export interface PracticeKeyPick {
  focus: string[];
  explore: string[];
}

function isUsableKey(key: string): boolean {
  return key.length > 0 && key !== " ";
}

export function eligiblePracticeKeys(
  stats: readonly RankedKey[],
  unlockedKeys: readonly string[],
  minAttempts = MIN_KEY_ATTEMPTS,
): RankedKey[] {
  const unlocked = new Set(unlockedKeys);
  return stats
    .filter(
      (row) =>
        isUsableKey(row.key) && unlocked.has(row.key) && row.attempts >= minAttempts,
    )
    .slice()
    .sort((a, b) => a.mastery - b.mastery || a.key.localeCompare(b.key));
}

export function pickWeakKeys(
  stats: readonly RankedKey[],
  unlockedKeys: readonly string[],
  options?: { minAttempts?: number; take?: number },
): PracticeKeyPick {
  const ranked = eligiblePracticeKeys(stats, unlockedKeys, options?.minAttempts);
  const take = Math.min(
    options?.take ?? WEAK_KEY_TAKE_MAX,
    Math.max(WEAK_KEY_TAKE_MIN, ranked.length),
    ranked.length,
  );
  const focus = ranked.slice(0, take).map((row) => row.key);
  const explore = ranked.slice(take, take + WEAK_KEY_TAKE_MIN).map((row) => row.key);
  return { focus, explore };
}

export function samplePracticeKey(
  pick: PracticeKeyPick,
  rng: () => number = Math.random,
): string | null {
  const { focus, explore } = pick;
  if (focus.length === 0) {
    return null;
  }
  if (explore.length > 0 && rng() < PRACTICE_EXPLORE_WEIGHT) {
    const index = Math.min(explore.length - 1, Math.floor(rng() * explore.length));
    return explore[index] ?? focus[0] ?? null;
  }
  const weights = focus.map((_, index) => focus.length - index);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let ticket = rng() * total;
  for (let i = 0; i < focus.length; i += 1) {
    ticket -= weights[i] ?? 0;
    if (ticket <= 0) {
      return focus[i] ?? focus[0] ?? null;
    }
  }
  return focus[0] ?? null;
}
