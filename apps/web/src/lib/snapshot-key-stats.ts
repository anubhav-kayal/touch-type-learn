import { applyKeyStatDelta } from "@keypath/scoring";
import type { GuestKeyStat } from "@keypath/shared-types";
import type { KeyStatSummary, TypingSnapshot } from "@keypath/typing-engine";

function toGuestKeyStat(row: KeyStatSummary): GuestKeyStat {
  return {
    key: row.key,
    attempts: row.attempts,
    correct: row.correct,
    errors: row.errors,
    averageLatencyMs: row.averageLatencyMs,
  };
}

export function snapshotKeyStats(
  snapshots: TypingSnapshot[],
): Record<string, GuestKeyStat> {
  const merged: Record<string, GuestKeyStat> = {};
  for (const snapshot of snapshots) {
    for (const row of Object.values(snapshot.keyStats)) {
      merged[row.key] = applyKeyStatDelta(merged[row.key], toGuestKeyStat(row));
    }
  }
  return merged;
}
