import type { KeyStatSummary } from "./types";

interface MutableKeyStat {
  key: string;
  attempts: number;
  correct: number;
  errors: number;
  latencySumMs: number;
  latencyCount: number;
  substitutions: Map<string, number>;
}

export function createKeyTracker(): Map<string, MutableKeyStat> {
  return new Map();
}

function getOrCreate(stats: Map<string, MutableKeyStat>, key: string): MutableKeyStat {
  const existing = stats.get(key);
  if (existing) {
    return existing;
  }
  const created: MutableKeyStat = {
    key,
    attempts: 0,
    correct: 0,
    errors: 0,
    latencySumMs: 0,
    latencyCount: 0,
    substitutions: new Map(),
  };
  stats.set(key, created);
  return created;
}

export function recordKeyAttempt(
  stats: Map<string, MutableKeyStat>,
  expectedKey: string,
  typedKey: string,
  correct: boolean,
  latencyMs: number | null,
): void {
  const entry = getOrCreate(stats, expectedKey);
  entry.attempts += 1;
  if (correct) {
    entry.correct += 1;
  } else {
    entry.errors += 1;
    entry.substitutions.set(typedKey, (entry.substitutions.get(typedKey) ?? 0) + 1);
  }
  if (latencyMs !== null && latencyMs >= 0) {
    entry.latencySumMs += latencyMs;
    entry.latencyCount += 1;
  }
}

export function summarizeKeyStats(
  stats: Map<string, MutableKeyStat>,
): Record<string, KeyStatSummary> {
  const summary: Record<string, KeyStatSummary> = {};
  for (const [key, entry] of stats) {
    const substitutions: Record<string, number> = {};
    for (const [typed, count] of entry.substitutions) {
      substitutions[typed] = count;
    }
    summary[key] = {
      key,
      attempts: entry.attempts,
      correct: entry.correct,
      errors: entry.errors,
      averageLatencyMs:
        entry.latencyCount === 0 ? null : entry.latencySumMs / entry.latencyCount,
      substitutions,
    };
  }
  return summary;
}
