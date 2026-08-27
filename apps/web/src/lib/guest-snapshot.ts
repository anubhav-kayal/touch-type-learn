import type {
  AttemptPoint,
  DailyBucket,
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

function parseAttemptPoint(value: unknown): AttemptPoint | null {
  if (!isRecord(value) || typeof value.at !== "string") {
    return null;
  }
  const wpm = asFiniteNumber(value.wpm);
  const accuracy = asFiniteNumber(value.accuracy);
  const durationMs = Math.max(0, Math.floor(asFiniteNumber(value.durationMs)));
  const characters = Math.max(0, Math.floor(asFiniteNumber(value.characters)));
  if (wpm < 0 || accuracy < 0 || accuracy > 1) {
    return null;
  }
  const consistency =
    value.consistency === null || value.consistency === undefined
      ? null
      : Math.max(0, Math.min(100, asFiniteNumber(value.consistency)));
  return {
    at: value.at,
    lessonId: typeof value.lessonId === "string" ? value.lessonId : null,
    wpm,
    accuracy,
    consistency,
    durationMs,
    characters,
    source: value.source === "practice" ? "practice" : "lesson",
  };
}

function parseDaily(value: unknown): Record<string, DailyBucket> {
  if (!isRecord(value)) {
    return {};
  }
  const daily: Record<string, DailyBucket> = {};
  for (const [date, row] of Object.entries(value)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isRecord(row)) {
      continue;
    }
    daily[date] = {
      date,
      practiceMinutes: Math.max(0, asFiniteNumber(row.practiceMinutes)),
      characters: Math.max(0, Math.floor(asFiniteNumber(row.characters))),
      lessonsCompleted: Math.max(0, Math.floor(asFiniteNumber(row.lessonsCompleted))),
      xpEarned: Math.max(0, Math.floor(asFiniteNumber(row.xpEarned))),
    };
  }
  return daily;
}

function parseRecentAttempts(value: unknown): AttemptPoint[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const points: AttemptPoint[] = [];
  for (const row of value) {
    const parsed = parseAttemptPoint(row);
    if (parsed) {
      points.push(parsed);
    }
  }
  return points.slice(-40);
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
    recentAttempts: parseRecentAttempts(raw.recentAttempts),
    daily: parseDaily(raw.daily),
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
