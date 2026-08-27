import { describe, expect, it } from "vitest";
import type { GuestSnapshot, ProgressSnapshot } from "@keypath/shared-types";
import {
  accountHasLessonProgress,
  emptyProgressSnapshot,
  mergeGuestIntoAccount,
  mergeStreak,
} from "./mergeGuest";

function guest(overrides: Partial<GuestSnapshot> = {}): GuestSnapshot {
  return {
    version: 1,
    ...emptyProgressSnapshot(),
    ...overrides,
    progress: overrides.progress ?? {},
    keyStats: overrides.keyStats ?? {},
    streak: overrides.streak ?? emptyProgressSnapshot().streak,
  };
}

function lesson(stars: number, xpEarned = 0, extras: Partial<GuestSnapshot["progress"][string]> = {}) {
  return {
    stars,
    bestWpm: extras.bestWpm ?? 20,
    bestAccuracy: extras.bestAccuracy ?? 0.9,
    attemptCount: extras.attemptCount ?? 1,
    xpEarned,
  };
}

describe("mergeGuestIntoAccount", () => {
  it("imports the guest snapshot when the account has no lessons", () => {
    const incoming = guest({
      xp: 140,
      progress: {
        "w1-orient": lesson(1, 100, { bestWpm: 18, bestAccuracy: 0.92 }),
        "w1-home-fj": lesson(2, 40, { bestWpm: 22 }),
      },
      keyStats: {
        f: { key: "f", attempts: 10, correct: 9, errors: 1, averageLatencyMs: 200 },
      },
      streak: {
        currentStreak: 3,
        longestStreak: 3,
        lastPracticeDate: "2026-08-26",
        practiceDaysMonth: 3,
      },
    });

    const merged = mergeGuestIntoAccount(emptyProgressSnapshot(), incoming);

    expect(accountHasLessonProgress(emptyProgressSnapshot())).toBe(false);
    expect(merged).toEqual({
      progress: incoming.progress,
      xp: 140,
      keyStats: incoming.keyStats,
      streak: incoming.streak,
      recentAttempts: incoming.recentAttempts,
      daily: incoming.daily,
      achievements: incoming.achievements,
      dailyChallenge: incoming.dailyChallenge,
    });
    expect(merged.progress["w1-orient"]).not.toBe(incoming.progress["w1-orient"]);
  });

  it("keeps the better of each lesson and does not drop account rows", () => {
    const account: ProgressSnapshot = {
      ...emptyProgressSnapshot(),
      xp: 100,
      progress: {
        "w1-orient": lesson(1, 100, { bestWpm: 16, bestAccuracy: 0.9, attemptCount: 2 }),
        "w1-home-fj": lesson(1, 80, { bestWpm: 19 }),
      },
    };
    const incoming = guest({
      xp: 250,
      progress: {
        "w1-orient": lesson(3, 120, { bestWpm: 28, bestAccuracy: 0.98, attemptCount: 1 }),
        "w1-home-dk": lesson(1, 90, { bestWpm: 21 }),
      },
    });

    const merged = mergeGuestIntoAccount(account, incoming);

    expect(merged.progress["w1-orient"]).toEqual({
      stars: 3,
      bestWpm: 28,
      bestAccuracy: 0.98,
      attemptCount: 3,
      xpEarned: 120,
    });
    expect(merged.progress["w1-home-fj"]?.stars).toBe(1);
    expect(merged.progress["w1-home-dk"]?.stars).toBe(1);
  });

  it("adds XP only for lessons the account had not completed", () => {
    const account: ProgressSnapshot = {
      ...emptyProgressSnapshot(),
      xp: 100,
      progress: {
        "w1-orient": lesson(1, 100),
      },
    };
    const incoming = guest({
      xp: 190,
      progress: {
        "w1-orient": lesson(2, 110),
        "w1-home-fj": lesson(1, 80),
      },
    });

    const merged = mergeGuestIntoAccount(account, incoming);

    expect(merged.xp).toBe(190);
  });

  it("does not double-count guest XP that already includes new lessons", () => {
    const account: ProgressSnapshot = {
      ...emptyProgressSnapshot(),
      xp: 50,
      progress: {
        "w1-orient": lesson(1, 50),
      },
    };
    const incoming = guest({
      xp: 200,
      progress: {
        "w1-home-fj": lesson(1, 150),
      },
    });

    expect(mergeGuestIntoAccount(account, incoming).xp).toBe(200);
  });

  it("adds key counters instead of replacing them", () => {
    const account: ProgressSnapshot = {
      ...emptyProgressSnapshot(),
      progress: { "w1-orient": lesson(1) },
      keyStats: {
        f: { key: "f", attempts: 4, correct: 3, errors: 1, averageLatencyMs: 100 },
      },
    };
    const incoming = guest({
      progress: { "w1-orient": lesson(1) },
      keyStats: {
        f: { key: "f", attempts: 6, correct: 5, errors: 1, averageLatencyMs: 200 },
        j: { key: "j", attempts: 2, correct: 2, errors: 0, averageLatencyMs: 150 },
      },
    });

    const merged = mergeGuestIntoAccount(account, incoming);
    expect(merged.keyStats.f).toEqual({
      key: "f",
      attempts: 10,
      correct: 8,
      errors: 2,
      averageLatencyMs: 160,
    });
    expect(merged.keyStats.j?.attempts).toBe(2);
  });
});

describe("mergeStreak", () => {
  it("keeps the snapshot with the later practice date", () => {
    expect(
      mergeStreak(
        {
          currentStreak: 9,
          longestStreak: 9,
          lastPracticeDate: "2026-08-20",
          practiceDaysMonth: 9,
        },
        {
          currentStreak: 2,
          longestStreak: 4,
          lastPracticeDate: "2026-08-26",
          practiceDaysMonth: 2,
        },
      ),
    ).toEqual({
      currentStreak: 2,
      longestStreak: 4,
      lastPracticeDate: "2026-08-26",
      practiceDaysMonth: 2,
    });
  });

  it("does not invent days when dates match", () => {
    expect(
      mergeStreak(
        {
          currentStreak: 3,
          longestStreak: 5,
          lastPracticeDate: "2026-08-26",
          practiceDaysMonth: 4,
        },
        {
          currentStreak: 1,
          longestStreak: 8,
          lastPracticeDate: "2026-08-26",
          practiceDaysMonth: 2,
        },
      ),
    ).toEqual({
      currentStreak: 3,
      longestStreak: 8,
      lastPracticeDate: "2026-08-26",
      practiceDaysMonth: 4,
    });
  });
});
