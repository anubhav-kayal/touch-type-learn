import type { GuestKeyStat, GuestLessonProgress, GuestSnapshot, GuestStreak } from "@keypath/shared-types";
import {
  addDailyActivity,
  appendAttemptPoint,
  applyKeyStatDelta,
  applyMetaProgress,
  applyStreakOnPass,
  emptyProgressSnapshot,
  levelFromXp,
  maxTimedWpm,
  mergeStreak,
  type ApplyMetaResult,
} from "@keypath/scoring";
import { parseGuestSnapshot, starsFromSnapshot, EMPTY_STARS } from "@/lib/guest-snapshot";

export const GUEST_STORAGE_KEY = "keypath.guest.v1";
export const LEGACY_PROGRESS_KEY = "keypath.progress.v1";
const CHANGE_EVENT = "keypath-progress";

export {
  EMPTY_STARS,
  guestSnapshotIsEmpty,
  parseGuestSnapshot,
  starsFromSnapshot,
} from "@/lib/guest-snapshot";

function readLegacyStars(): GuestSnapshot | null {
  const raw = window.localStorage.getItem(LEGACY_PROGRESS_KEY);
  if (!raw) {
    return null;
  }
  try {
    return parseGuestSnapshot(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function readGuestSnapshot(): GuestSnapshot {
  const empty: GuestSnapshot = { version: 1, ...emptyProgressSnapshot() };
  if (typeof window === "undefined") {
    return empty;
  }
  try {
    const raw = window.localStorage.getItem(GUEST_STORAGE_KEY);
    if (raw) {
      return parseGuestSnapshot(JSON.parse(raw) as unknown);
    }
    const legacy = readLegacyStars();
    if (legacy) {
      writeGuestSnapshot(legacy);
      window.localStorage.removeItem(LEGACY_PROGRESS_KEY);
      return legacy;
    }
    return empty;
  } catch {
    return empty;
  }
}

export function writeGuestSnapshot(snapshot: GuestSnapshot): void {
  window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function clearGuestSnapshot(): void {
  window.localStorage.removeItem(GUEST_STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_PROGRESS_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

let cachedStars: Record<string, number> = EMPTY_STARS;
let cachedStarsKey = "";

export function readStars(): Record<string, number> {
  const next = starsFromSnapshot(readGuestSnapshot());
  const key = JSON.stringify(next);
  if (key === cachedStarsKey) {
    return cachedStars;
  }
  cachedStarsKey = key;
  cachedStars = Object.keys(next).length === 0 ? EMPTY_STARS : next;
  return cachedStars;
}

export function getServerStarsSnapshot(): Record<string, number> {
  return EMPTY_STARS;
}

export interface ProgressHud {
  xp: number;
  level: number;
  currentStreak: number;
  lastPracticeDate: string | null;
}

export const EMPTY_HUD: ProgressHud = {
  xp: 0,
  level: 1,
  currentStreak: 0,
  lastPracticeDate: null,
};

let cachedHud: ProgressHud = EMPTY_HUD;
let cachedHudKey = "";

export function readProgressHud(): ProgressHud {
  const snapshot = readGuestSnapshot();
  const next: ProgressHud = {
    xp: snapshot.xp,
    level: levelFromXp(snapshot.xp),
    currentStreak: snapshot.streak.currentStreak,
    lastPracticeDate: snapshot.streak.lastPracticeDate,
  };
  const key = `${next.xp}:${next.level}:${next.currentStreak}:${next.lastPracticeDate ?? ""}`;
  if (key === cachedHudKey) {
    return cachedHud;
  }
  cachedHudKey = key;
  cachedHud =
    next.xp === 0 && next.currentStreak === 0 && next.lastPracticeDate === null
      ? EMPTY_HUD
      : next;
  return cachedHud;
}

export function getServerProgressHud(): ProgressHud {
  return EMPTY_HUD;
}

export function guestHasUnmigratedWork(snapshot: GuestSnapshot): boolean {
  return (
    Object.values(snapshot.progress).some((row) => row.attemptCount > 0) ||
    Object.keys(snapshot.keyStats).length > 0 ||
    Object.keys(snapshot.achievements).length > 0
  );
}

export function recordStars(lessonId: string, stars: number): void {
  recordGuestAttempt({
    lessonId,
    stars,
    wpm: 0,
    accuracy: 0,
  });
}

export function recordGuestAttempt(input: {
  lessonId: string;
  stars: number;
  wpm: number;
  accuracy: number;
  xpAwarded?: number;
  keyStats?: Record<string, GuestKeyStat>;
  durationMs?: number;
  consistency?: number | null;
  now?: Date;
}): ApplyMetaResult & { snapshot: GuestSnapshot } {
  const current = readGuestSnapshot();
  const previous = current.progress[input.lessonId];
  const xpAwarded = Math.max(0, input.xpAwarded ?? 0);
  const nextRow: GuestLessonProgress = {
    stars: Math.max(previous?.stars ?? 0, input.stars),
    bestWpm: Math.max(previous?.bestWpm ?? 0, input.wpm),
    bestAccuracy: Math.max(previous?.bestAccuracy ?? 0, input.accuracy),
    attemptCount: (previous?.attemptCount ?? 0) + 1,
    xpEarned: (previous?.xpEarned ?? 0) + xpAwarded,
  };

  const keyStats = { ...current.keyStats };
  if (input.keyStats) {
    for (const incoming of Object.values(input.keyStats)) {
      keyStats[incoming.key] = applyKeyStatDelta(keyStats[incoming.key], incoming);
    }
  }

  const characters = Object.values(input.keyStats ?? {}).reduce(
    (sum, row) => sum + row.attempts,
    0,
  );
  const durationMs = Math.max(0, input.durationMs ?? 0);
  const now = input.now ?? new Date();
  const hasSession = durationMs > 0 || characters > 0;
  const priorTimedBestWpm = maxTimedWpm(current.recentAttempts ?? []);

  const next: GuestSnapshot = {
    ...current,
    progress: { ...current.progress, [input.lessonId]: nextRow },
    keyStats,
    xp: current.xp + xpAwarded,
    streak:
      input.stars >= 1 ? applyStreakOnPass(current.streak, now) : current.streak,
    recentAttempts: hasSession
      ? appendAttemptPoint(current.recentAttempts ?? [], {
          at: now.toISOString(),
          lessonId: input.lessonId,
          wpm: input.wpm,
          accuracy: input.accuracy,
          consistency: input.consistency ?? null,
          durationMs,
          characters,
          source: "lesson",
        })
      : (current.recentAttempts ?? []),
    daily: hasSession
      ? addDailyActivity(current.daily ?? {}, {
          now,
          minutes: durationMs / 60_000,
          characters,
          lessonsCompleted: input.stars >= 1 ? 1 : 0,
          xpEarned: xpAwarded,
        })
      : (current.daily ?? {}),
  };
  const recorded = applyMetaProgress(next, {
    lessonId: input.lessonId,
    stars: input.stars,
    accuracy: input.accuracy,
    wpm: input.wpm,
    durationMs,
    characters,
    source: "lesson",
    priorTimedBestWpm,
    now,
  });
  const snapshot: GuestSnapshot = { version: 1, ...recorded.snapshot };
  writeGuestSnapshot(snapshot);
  return { ...recorded, snapshot };
}

export function recordPracticeAttempt(input: {
  wpm: number;
  accuracy: number;
  durationMs: number;
  consistency?: number | null;
  keyStats: Record<string, GuestKeyStat>;
  practiceMode?: string;
  now?: Date;
}): ApplyMetaResult & { snapshot: GuestSnapshot } {
  const current = readGuestSnapshot();
  const keyStats = { ...current.keyStats };
  for (const row of Object.values(input.keyStats)) {
    keyStats[row.key] = applyKeyStatDelta(keyStats[row.key], row);
  }
  const characters = Object.values(input.keyStats).reduce((sum, row) => sum + row.attempts, 0);
  const now = input.now ?? new Date();
  const priorTimedBestWpm = maxTimedWpm(current.recentAttempts ?? []);
  const next: GuestSnapshot = {
    ...current,
    keyStats,
    recentAttempts: appendAttemptPoint(current.recentAttempts ?? [], {
      at: now.toISOString(),
      lessonId: null,
      wpm: input.wpm,
      accuracy: input.accuracy,
      consistency: input.consistency ?? null,
      durationMs: input.durationMs,
      characters,
      source: "practice",
    }),
    daily: addDailyActivity(current.daily ?? {}, {
      now,
      minutes: input.durationMs / 60_000,
      characters,
      lessonsCompleted: 0,
      xpEarned: 0,
    }),
  };
  const recorded = applyMetaProgress(next, {
    stars: 0,
    accuracy: input.accuracy,
    wpm: input.wpm,
    durationMs: input.durationMs,
    characters,
    source: "practice",
    practiceMode: input.practiceMode,
    priorTimedBestWpm,
    now,
  });
  const snapshot: GuestSnapshot = { version: 1, ...recorded.snapshot };
  writeGuestSnapshot(snapshot);
  return { ...recorded, snapshot };
}

export function recordWordRainAttempt(input: {
  wpm: number;
  accuracy: number;
  durationMs: number;
  consistency?: number | null;
  keyStats: Record<string, GuestKeyStat>;
  caught: number;
  missed: number;
  xpAwarded?: number;
  now?: Date;
}): ApplyMetaResult & { snapshot: GuestSnapshot } {
  const current = readGuestSnapshot();
  const keyStats = { ...current.keyStats };
  for (const row of Object.values(input.keyStats)) {
    keyStats[row.key] = applyKeyStatDelta(keyStats[row.key], row);
  }
  const characters = Object.values(input.keyStats).reduce((sum, row) => sum + row.attempts, 0);
  const now = input.now ?? new Date();
  const xpAwarded = Math.max(0, input.xpAwarded ?? 0);
  const passed = input.caught >= 1;
  const priorTimedBestWpm = maxTimedWpm(current.recentAttempts ?? []);
  const next: GuestSnapshot = {
    ...current,
    keyStats,
    xp: current.xp + xpAwarded,
    streak: passed ? applyStreakOnPass(current.streak, now) : current.streak,
    recentAttempts: appendAttemptPoint(current.recentAttempts ?? [], {
      at: now.toISOString(),
      lessonId: null,
      wpm: input.wpm,
      accuracy: input.accuracy,
      consistency: input.consistency ?? null,
      durationMs: input.durationMs,
      characters,
      source: "word-rain",
    }),
    daily: addDailyActivity(current.daily ?? {}, {
      now,
      minutes: input.durationMs / 60_000,
      characters,
      lessonsCompleted: 0,
      xpEarned: xpAwarded,
    }),
  };
  const recorded = applyMetaProgress(next, {
    stars: 0,
    accuracy: input.accuracy,
    wpm: input.wpm,
    durationMs: input.durationMs,
    characters,
    source: "word-rain",
    priorTimedBestWpm,
    now,
  });
  const snapshot: GuestSnapshot = { version: 1, ...recorded.snapshot };
  writeGuestSnapshot(snapshot);
  return { ...recorded, snapshot };
}

export function recordPracticeKeyStats(
  incoming: Record<string, GuestKeyStat>,
): GuestSnapshot {
  const current = readGuestSnapshot();
  const keyStats = { ...current.keyStats };
  for (const row of Object.values(incoming)) {
    keyStats[row.key] = applyKeyStatDelta(keyStats[row.key], row);
  }
  const next: GuestSnapshot = { ...current, keyStats };
  writeGuestSnapshot(next);
  return next;
}

const EMPTY_KEY_STATS: Record<string, GuestKeyStat> = {};
let cachedKeyStats: Record<string, GuestKeyStat> = EMPTY_KEY_STATS;
let cachedKeyStatsKey = "";

export function readKeyStats(): Record<string, GuestKeyStat> {
  const next = readGuestSnapshot().keyStats;
  const key = JSON.stringify(next);
  if (key === cachedKeyStatsKey) {
    return cachedKeyStats;
  }
  cachedKeyStatsKey = key;
  cachedKeyStats = Object.keys(next).length === 0 ? EMPTY_KEY_STATS : next;
  return cachedKeyStats;
}

export function getServerKeyStats(): Record<string, GuestKeyStat> {
  return EMPTY_KEY_STATS;
}

export function overlayStars(stars: Record<string, number>): void {
  const current = readGuestSnapshot();
  const progress = { ...current.progress };
  for (const [lessonId, value] of Object.entries(stars)) {
    const previous = progress[lessonId];
    progress[lessonId] = {
      stars: Math.max(previous?.stars ?? 0, value),
      bestWpm: previous?.bestWpm ?? 0,
      bestAccuracy: previous?.bestAccuracy ?? 0,
      attemptCount: previous?.attemptCount ?? 0,
      xpEarned: previous?.xpEarned ?? 0,
    };
  }
  writeGuestSnapshot({ ...current, progress });
}

export function overlayAccountProgress(input: {
  stars: Record<string, number>;
  xp: number;
  streak: GuestStreak;
  keyStats?: Record<string, GuestKeyStat>;
  recentAttempts?: GuestSnapshot["recentAttempts"];
  daily?: GuestSnapshot["daily"];
  achievements?: GuestSnapshot["achievements"];
  dailyChallenge?: GuestSnapshot["dailyChallenge"];
}): void {
  overlayStars(input.stars);
  const current = readGuestSnapshot();
  writeGuestSnapshot({
    ...current,
    xp: Math.max(current.xp, input.xp),
    streak: mergeStreak(current.streak, input.streak),
    keyStats: input.keyStats ?? current.keyStats,
    recentAttempts: input.recentAttempts ?? current.recentAttempts,
    daily: input.daily ?? current.daily,
    achievements: input.achievements ?? current.achievements,
    dailyChallenge: input.dailyChallenge ?? current.dailyChallenge,
  });
}

export function subscribeProgress(onStoreChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}
