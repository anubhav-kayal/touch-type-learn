import type { GuestKeyStat, GuestLessonProgress, GuestSnapshot } from "@keypath/shared-types";
import { emptyProgressSnapshot } from "@keypath/scoring";
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
  xpEarned?: number;
  keyStats?: Record<string, GuestKeyStat>;
}): GuestSnapshot {
  const current = readGuestSnapshot();
  const previous = current.progress[input.lessonId];
  const nextRow: GuestLessonProgress = {
    stars: Math.max(previous?.stars ?? 0, input.stars),
    bestWpm: Math.max(previous?.bestWpm ?? 0, input.wpm),
    bestAccuracy: Math.max(previous?.bestAccuracy ?? 0, input.accuracy),
    attemptCount: (previous?.attemptCount ?? 0) + 1,
    xpEarned: Math.max(previous?.xpEarned ?? 0, input.xpEarned ?? 0),
  };

  const keyStats = { ...current.keyStats };
  if (input.keyStats) {
    for (const [key, incoming] of Object.entries(input.keyStats)) {
      const existing = keyStats[key];
      if (!existing) {
        keyStats[key] = { ...incoming };
        continue;
      }
      const attempts = existing.attempts + incoming.attempts;
      let averageLatencyMs = existing.averageLatencyMs;
      if (existing.averageLatencyMs !== null && incoming.averageLatencyMs !== null) {
        averageLatencyMs =
          (existing.averageLatencyMs * existing.attempts +
            incoming.averageLatencyMs * incoming.attempts) /
          Math.max(attempts, 1);
      } else {
        averageLatencyMs = existing.averageLatencyMs ?? incoming.averageLatencyMs;
      }
      keyStats[key] = {
        key,
        attempts,
        correct: existing.correct + incoming.correct,
        errors: existing.errors + incoming.errors,
        averageLatencyMs,
      };
    }
  }

  const next: GuestSnapshot = {
    ...current,
    progress: { ...current.progress, [input.lessonId]: nextRow },
    keyStats,
  };
  writeGuestSnapshot(next);
  return next;
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

export function subscribeProgress(onStoreChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}
