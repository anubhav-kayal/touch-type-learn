import type { AttemptPoint, DailyBucket, ProgressSnapshot } from "@keypath/shared-types";
import { masteryForKeyStat } from "./applyKeyStatDelta";
import { RECENT_ATTEMPTS_MAX } from "./thresholds";
import { utcDateString } from "./utcDate";

export function appendAttemptPoint(
  points: AttemptPoint[],
  point: AttemptPoint,
): AttemptPoint[] {
  return [...points, point].slice(-RECENT_ATTEMPTS_MAX);
}

export function addDailyActivity(
  daily: Record<string, DailyBucket>,
  input: {
    date?: string;
    minutes: number;
    characters: number;
    lessonsCompleted: number;
    xpEarned: number;
    now?: Date;
  },
): Record<string, DailyBucket> {
  const date = input.date ?? utcDateString(input.now);
  const current = daily[date] ?? {
    date,
    practiceMinutes: 0,
    characters: 0,
    lessonsCompleted: 0,
    xpEarned: 0,
  };
  return {
    ...daily,
    [date]: {
      date,
      practiceMinutes: current.practiceMinutes + input.minutes,
      characters: current.characters + input.characters,
      lessonsCompleted: current.lessonsCompleted + input.lessonsCompleted,
      xpEarned: current.xpEarned + input.xpEarned,
    },
  };
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function summarizeAttempts(points: AttemptPoint[]): {
  attemptCount: number;
  averageWpm: number | null;
  bestWpm: number;
  averageAccuracy: number | null;
  bestAccuracy: number;
  averageConsistency: number | null;
  practiceMinutes: number;
  characters: number;
  series: { at: string; wpm: number; accuracy: number }[];
} {
  const wpm = points.map((point) => point.wpm);
  const accuracy = points.map((point) => point.accuracy);
  const consistency = points
    .map((point) => point.consistency)
    .filter((value): value is number => value !== null);
  return {
    attemptCount: points.length,
    averageWpm: average(wpm),
    bestWpm: wpm.length === 0 ? 0 : Math.max(...wpm),
    averageAccuracy: average(accuracy),
    bestAccuracy: accuracy.length === 0 ? 0 : Math.max(...accuracy),
    averageConsistency: average(consistency),
    practiceMinutes: points.reduce((sum, point) => sum + point.durationMs, 0) / 60_000,
    characters: points.reduce((sum, point) => sum + point.characters, 0),
    series: points.map((point) => ({
      at: point.at,
      wpm: point.wpm,
      accuracy: point.accuracy,
    })),
  };
}

export function activitySeries(
  daily: Record<string, DailyBucket>,
  days = 14,
  now: Date = new Date(),
): { date: string; minutes: number }[] {
  const series: { date: string; minutes: number }[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() - offset);
    const key = utcDateString(date);
    series.push({ date: key, minutes: daily[key]?.practiceMinutes ?? 0 });
  }
  return series;
}

export function keyTable(snapshot: ProgressSnapshot): {
  key: string;
  attempts: number;
  accuracy: number;
  mastery: number;
}[] {
  return Object.values(snapshot.keyStats)
    .filter((row) => row.key !== " " && row.attempts > 0)
    .map((row) => ({
      key: row.key,
      attempts: row.attempts,
      accuracy: row.attempts > 0 ? row.correct / row.attempts : 0,
      mastery: masteryForKeyStat(row),
    }))
    .sort((a, b) => a.mastery - b.mastery || a.key.localeCompare(b.key));
}

export function todayBucket(
  daily: Record<string, DailyBucket>,
  now: Date = new Date(),
): DailyBucket {
  const date = utcDateString(now);
  return (
    daily[date] ?? {
      date,
      practiceMinutes: 0,
      characters: 0,
      lessonsCompleted: 0,
      xpEarned: 0,
    }
  );
}

export function lastAttempt(points: AttemptPoint[]): AttemptPoint | null {
  return points[points.length - 1] ?? null;
}

export function completedLessonCount(snapshot: ProgressSnapshot): number {
  return Object.values(snapshot.progress).filter((row) => row.stars >= 1).length;
}
