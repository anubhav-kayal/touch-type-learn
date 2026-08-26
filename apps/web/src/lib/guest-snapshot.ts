import type {
  GuestKeyStat,
  GuestLessonProgress,
  GuestSnapshot,
  GuestStreak,
} from "@keypath/shared-types";
import { emptyProgressSnapshot } from "@keypath/scoring";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asFiniteNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function parseLessonProgress(value: unknown): GuestLessonProgress | null {
  if (!isRecord(value)) {
    return null;
  }
  const stars = Math.max(0, Math.min(3, Math.floor(asFiniteNumber(value.stars))));
  return {
    stars,
    bestWpm: Math.max(0, asFiniteNumber(value.bestWpm)),
    bestAccuracy: Math.max(0, Math.min(1, asFiniteNumber(value.bestAccuracy))),
    attemptCount: Math.max(0, Math.floor(asFiniteNumber(value.attemptCount))),
    xpEarned: Math.max(0, Math.floor(asFiniteNumber(value.xpEarned))),
  };
}

function parseKeyStat(key: string, value: unknown): GuestKeyStat | null {
  if (!isRecord(value)) {
    return null;
  }
  return {
    key: typeof value.key === "string" ? value.key : key,
    attempts: Math.max(0, Math.floor(asFiniteNumber(value.attempts))),
    correct: Math.max(0, Math.floor(asFiniteNumber(value.correct))),
    errors: Math.max(0, Math.floor(asFiniteNumber(value.errors))),
    averageLatencyMs:
      value.averageLatencyMs === null || value.averageLatencyMs === undefined
        ? null
        : Math.max(0, asFiniteNumber(value.averageLatencyMs)),
  };
}

function parseStreak(value: unknown): GuestStreak {
  const empty = emptyProgressSnapshot().streak;
  if (!isRecord(value)) {
    return empty;
  }
  const lastPracticeDate =
    typeof value.lastPracticeDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.lastPracticeDate)
      ? value.lastPracticeDate
      : null;
  return {
    currentStreak: Math.max(0, Math.floor(asFiniteNumber(value.currentStreak))),
    longestStreak: Math.max(0, Math.floor(asFiniteNumber(value.longestStreak))),
    lastPracticeDate,
    practiceDaysMonth: Math.max(0, Math.floor(asFiniteNumber(value.practiceDaysMonth))),
  };
}

export function parseGuestSnapshot(raw: unknown): GuestSnapshot {
  const empty: GuestSnapshot = { version: 1, ...emptyProgressSnapshot() };
  if (!isRecord(raw) || raw.version !== 1) {
    return empty;
  }

  if (isRecord(raw.stars) && !isRecord(raw.progress)) {
    const progress: Record<string, GuestLessonProgress> = {};
    for (const [lessonId, stars] of Object.entries(raw.stars)) {
      const value = Math.max(0, Math.min(3, Math.floor(asFiniteNumber(stars))));
      if (value > 0) {
        progress[lessonId] = {
          stars: value,
          bestWpm: 0,
          bestAccuracy: 0,
          attemptCount: 1,
          xpEarned: 0,
        };
      }
    }
    return { version: 1, ...emptyProgressSnapshot(), progress };
  }

  const progress: Record<string, GuestLessonProgress> = {};
  if (isRecord(raw.progress)) {
    for (const [lessonId, row] of Object.entries(raw.progress)) {
      const parsed = parseLessonProgress(row);
      if (parsed) {
        progress[lessonId] = parsed;
      }
    }
  }

  const keyStats: Record<string, GuestKeyStat> = {};
  if (isRecord(raw.keyStats)) {
    for (const [key, row] of Object.entries(raw.keyStats)) {
      const parsed = parseKeyStat(key, row);
      if (parsed) {
        keyStats[key] = parsed;
      }
    }
  }

  return {
    version: 1,
    progress,
    xp: Math.max(0, Math.floor(asFiniteNumber(raw.xp))),
    keyStats,
    streak: parseStreak(raw.streak),
  };
}

export const EMPTY_STARS: Record<string, number> = {};

export function starsFromSnapshot(snapshot: GuestSnapshot): Record<string, number> {
  const stars: Record<string, number> = {};
  for (const [lessonId, row] of Object.entries(snapshot.progress)) {
    if (row.stars > 0) {
      stars[lessonId] = row.stars;
    }
  }
  return Object.keys(stars).length === 0 ? EMPTY_STARS : stars;
}

export function guestSnapshotIsEmpty(snapshot: GuestSnapshot): boolean {
  return Object.keys(snapshot.progress).length === 0 && snapshot.xp === 0;
}
