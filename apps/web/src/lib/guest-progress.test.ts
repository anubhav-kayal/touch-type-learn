import { beforeEach, describe, expect, it } from "vitest";
import {
  LEGACY_PROGRESS_KEY,
  getServerStarsSnapshot,
  guestHasUnmigratedWork,
  parseGuestSnapshot,
  readGuestSnapshot,
  readStars,
  recordGuestAttempt,
  recordPracticeKeyStats,
  recordStars,
  starsFromSnapshot,
} from "@/lib/guest-progress";

const memory = new Map<string, string>();

beforeEach(() => {
  memory.clear();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
      removeItem: (key: string) => {
        memory.delete(key);
      },
      clear: () => memory.clear(),
    },
  });
});

describe("guest snapshot", () => {
  it("migrates keypath.progress.v1 stars into guest.v1", () => {
    window.localStorage.setItem(
      LEGACY_PROGRESS_KEY,
      JSON.stringify({ version: 1, stars: { "w1-orient": 2, "w1-home-fj": 1 } }),
    );

    expect(readStars()).toEqual({ "w1-orient": 2, "w1-home-fj": 1 });
    expect(readGuestSnapshot().progress["w1-orient"]?.stars).toBe(2);
    expect(window.localStorage.getItem(LEGACY_PROGRESS_KEY)).toBeNull();
  });

  it("keeps the best stars when recording a weaker retry", () => {
    recordStars("w1-orient", 2);
    recordStars("w1-orient", 1);
    expect(readStars()["w1-orient"]).toBe(2);
    expect(readGuestSnapshot().progress["w1-orient"]?.attemptCount).toBe(2);
  });

  it("treats a stars-only payload as a guest snapshot", () => {
    const parsed = parseGuestSnapshot({
      version: 1,
      stars: { "w1-orient": 1 },
    });
    expect(starsFromSnapshot(parsed)).toEqual({ "w1-orient": 1 });
  });

  it("returns a stable snapshot for useSyncExternalStore", () => {
    expect(getServerStarsSnapshot()).toBe(getServerStarsSnapshot());
    expect(readStars()).toBe(readStars());
    recordStars("w1-orient", 1);
    expect(readStars()).toBe(readStars());
  });

  it("adds XP and a UTC streak only when the lesson is passed", () => {
    const now = new Date("2026-08-27T12:00:00.000Z");
    recordGuestAttempt({
      lessonId: "w1-orient",
      stars: 0,
      wpm: 10,
      accuracy: 0.8,
      xpAwarded: 0,
      now,
    });
    expect(readGuestSnapshot().xp).toBe(0);
    expect(readGuestSnapshot().streak.currentStreak).toBe(0);
    expect(guestHasUnmigratedWork(readGuestSnapshot())).toBe(true);

    recordGuestAttempt({
      lessonId: "w1-orient",
      stars: 1,
      wpm: 14,
      accuracy: 0.92,
      xpAwarded: 50,
      now,
    });
    recordGuestAttempt({
      lessonId: "w1-orient",
      stars: 2,
      wpm: 16,
      accuracy: 0.96,
      xpAwarded: 15,
      now,
    });

    const snapshot = readGuestSnapshot();
    expect(snapshot.xp).toBe(90);
    expect(snapshot.progress["w1-orient"]?.xpEarned).toBe(65);
    expect(snapshot.achievements["first-lesson"]).toBeTruthy();
    expect(snapshot.streak.currentStreak).toBe(1);
    expect(snapshot.streak.lastPracticeDate).toBe("2026-08-27");
  });

  it("unlocks Home Row Hero when the World 1 boss is passed", () => {
    recordGuestAttempt({
      lessonId: "w1-home-boss",
      stars: 1,
      wpm: 24,
      accuracy: 0.94,
      xpAwarded: 150,
      now: new Date("2026-08-27T12:00:00.000Z"),
    });
    expect(readGuestSnapshot().achievements["home-row-hero"]).toBeTruthy();
  });

  it("updates key stats from practice without XP or streak", () => {
    recordPracticeKeyStats({
      f: { key: "f", attempts: 12, correct: 10, errors: 2, averageLatencyMs: 200 },
    });
    const snapshot = readGuestSnapshot();
    expect(snapshot.keyStats.f?.attempts).toBe(12);
    expect(snapshot.xp).toBe(0);
    expect(snapshot.streak.currentStreak).toBe(0);
    expect(guestHasUnmigratedWork(snapshot)).toBe(true);
  });
});
