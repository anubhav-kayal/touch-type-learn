import type { GuestKeyStat } from "@keypath/shared-types";
import { calculateMastery, mergeLatencyEma } from "./calculateMastery";

export function applyKeyStatDelta(
  previous: GuestKeyStat | undefined,
  incoming: GuestKeyStat,
): GuestKeyStat {
  return {
    key: incoming.key || previous?.key || "",
    attempts: (previous?.attempts ?? 0) + incoming.attempts,
    correct: (previous?.correct ?? 0) + incoming.correct,
    errors: (previous?.errors ?? 0) + incoming.errors,
    averageLatencyMs: mergeLatencyEma(
      previous?.averageLatencyMs ?? null,
      incoming.averageLatencyMs,
    ),
  };
}

export function masteryForKeyStat(stat: GuestKeyStat): number {
  return calculateMastery({
    attempts: stat.attempts,
    correct: stat.correct,
    averageLatencyMs: stat.averageLatencyMs,
    recencyAccuracy: stat.attempts > 0 ? stat.correct / stat.attempts : 0.5,
    consistency: null,
  });
}
