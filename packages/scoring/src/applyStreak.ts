import type { GuestStreak } from "@keypath/shared-types";
import { previousUtcDate, utcDateString } from "./utcDate";

/**
 * Apply a passed lesson to streak state. Call only when the attempt earned ≥1★.
 * Same UTC day does not increment again. A gap quietly resets current to 1.
 */
export function applyStreakOnPass(
  streak: GuestStreak,
  now: Date = new Date(),
): GuestStreak {
  const today = utcDateString(now);
  const last = streak.lastPracticeDate;

  if (last === today) {
    return {
      ...streak,
      currentStreak: Math.max(streak.currentStreak, 1),
      longestStreak: Math.max(streak.longestStreak, Math.max(streak.currentStreak, 1)),
      lastPracticeDate: today,
      practiceDaysMonth: Math.max(streak.practiceDaysMonth, 1),
    };
  }

  const currentStreak = last === previousUtcDate(today) ? streak.currentStreak + 1 : 1;
  const lastMonth = last?.slice(0, 7);
  const thisMonth = today.slice(0, 7);
  const practiceDaysMonth =
    lastMonth === thisMonth ? streak.practiceDaysMonth + 1 : 1;

  return {
    currentStreak,
    longestStreak: Math.max(streak.longestStreak, currentStreak),
    lastPracticeDate: today,
    practiceDaysMonth,
  };
}
