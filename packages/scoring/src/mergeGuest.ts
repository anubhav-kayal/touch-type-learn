import type {
  GuestKeyStat,
  GuestLessonProgress,
  GuestSnapshot,
  GuestStreak,
  ProgressSnapshot,
} from "@keypath/shared-types";

export function emptyProgressSnapshot(): ProgressSnapshot {
  return {
    progress: {},
    xp: 0,
    keyStats: {},
    streak: emptyStreak(),
  };
}

export function emptyStreak(): GuestStreak {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    practiceDaysMonth: 0,
  };
}

export function accountHasLessonProgress(account: ProgressSnapshot): boolean {
  return Object.keys(account.progress).length > 0;
}

function cloneLesson(row: GuestLessonProgress): GuestLessonProgress {
  return { ...row };
}

function cloneKeyStat(row: GuestKeyStat): GuestKeyStat {
  return { ...row };
}

function mergeLesson(
  account: GuestLessonProgress | undefined,
  guest: GuestLessonProgress | undefined,
): GuestLessonProgress {
  if (!account && guest) {
    return cloneLesson(guest);
  }
  if (account && !guest) {
    return cloneLesson(account);
  }
  if (!account || !guest) {
    return {
      stars: 0,
      bestWpm: 0,
      bestAccuracy: 0,
      attemptCount: 0,
      xpEarned: 0,
    };
  }
  return {
    stars: Math.max(account.stars, guest.stars),
    bestWpm: Math.max(account.bestWpm, guest.bestWpm),
    bestAccuracy: Math.max(account.bestAccuracy, guest.bestAccuracy),
    attemptCount: account.attemptCount + guest.attemptCount,
    xpEarned: Math.max(account.xpEarned, guest.xpEarned),
  };
}

function mergeKeyStat(
  account: GuestKeyStat | undefined,
  guest: GuestKeyStat | undefined,
): GuestKeyStat {
  if (!account && guest) {
    return cloneKeyStat(guest);
  }
  if (account && !guest) {
    return cloneKeyStat(account);
  }
  if (!account || !guest) {
    return {
      key: "",
      attempts: 0,
      correct: 0,
      errors: 0,
      averageLatencyMs: null,
    };
  }
  const attempts = account.attempts + guest.attempts;
  let averageLatencyMs: number | null = null;
  if (account.averageLatencyMs !== null && guest.averageLatencyMs !== null) {
    averageLatencyMs =
      (account.averageLatencyMs * account.attempts +
        guest.averageLatencyMs * guest.attempts) /
      Math.max(attempts, 1);
  } else {
    averageLatencyMs = account.averageLatencyMs ?? guest.averageLatencyMs;
  }
  return {
    key: account.key || guest.key,
    attempts,
    correct: account.correct + guest.correct,
    errors: account.errors + guest.errors,
    averageLatencyMs,
  };
}

export function mergeStreak(account: GuestStreak, guest: GuestStreak): GuestStreak {
  if (!account.lastPracticeDate) {
    return { ...guest };
  }
  if (!guest.lastPracticeDate) {
    return { ...account };
  }
  if (account.lastPracticeDate > guest.lastPracticeDate) {
    return { ...account };
  }
  if (guest.lastPracticeDate > account.lastPracticeDate) {
    return { ...guest };
  }
  return {
    currentStreak: Math.max(account.currentStreak, guest.currentStreak),
    longestStreak: Math.max(account.longestStreak, guest.longestStreak),
    lastPracticeDate: account.lastPracticeDate,
    practiceDaysMonth: Math.max(account.practiceDaysMonth, guest.practiceDaysMonth),
  };
}

function lessonCompleted(row: GuestLessonProgress | undefined): boolean {
  return (row?.stars ?? 0) >= 1;
}

/**
 * Merge guest local progress into an account.
 *
 * Empty account: import the guest snapshot.
 * Existing account: never delete server lessons. Stars / best WPM / accuracy
 * take the max. Attempts and key counters add. XP is
 * max(account.xp + XP from guest lessons the account had not completed, guest.xp)
 * so overlapping lessons cannot double-count.
 */
export function mergeGuestIntoAccount(
  account: ProgressSnapshot,
  guest: GuestSnapshot | ProgressSnapshot,
): ProgressSnapshot {
  if (!accountHasLessonProgress(account)) {
    return {
      progress: Object.fromEntries(
        Object.entries(guest.progress).map(([id, row]) => [id, cloneLesson(row)]),
      ),
      xp: guest.xp,
      keyStats: Object.fromEntries(
        Object.entries(guest.keyStats).map(([key, row]) => [key, cloneKeyStat(row)]),
      ),
      streak: { ...guest.streak },
    };
  }

  const lessonIds = new Set([
    ...Object.keys(account.progress),
    ...Object.keys(guest.progress),
  ]);
  const progress: Record<string, GuestLessonProgress> = {};
  for (const id of lessonIds) {
    progress[id] = mergeLesson(account.progress[id], guest.progress[id]);
  }

  const keyIds = new Set([
    ...Object.keys(account.keyStats),
    ...Object.keys(guest.keyStats),
  ]);
  const keyStats: Record<string, GuestKeyStat> = {};
  for (const key of keyIds) {
    keyStats[key] = mergeKeyStat(account.keyStats[key], guest.keyStats[key]);
  }

  let newLessonXp = 0;
  for (const [id, row] of Object.entries(guest.progress)) {
    if (!lessonCompleted(account.progress[id])) {
      newLessonXp += row.xpEarned;
    }
  }

  return {
    progress,
    xp: Math.max(account.xp + newLessonXp, guest.xp),
    keyStats,
    streak: mergeStreak(account.streak, guest.streak),
  };
}
