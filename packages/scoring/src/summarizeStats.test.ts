import { describe, expect, it } from "vitest";
import { emptyProgressSnapshot } from "./mergeGuest";
import { summarizeAttempts } from "./summarizeStats";

describe("summarizeAttempts", () => {
  it("returns empty averages when there are no attempts", () => {
    const summary = summarizeAttempts([]);
    expect(summary.attemptCount).toBe(0);
    expect(summary.averageWpm).toBeNull();
    expect(summary.bestWpm).toBe(0);
  });

  it("averages WPM and accuracy from recorded attempts", () => {
    const summary = summarizeAttempts([
      {
        at: "2026-08-27T10:00:00.000Z",
        lessonId: "w1-orient",
        wpm: 10,
        accuracy: 0.9,
        consistency: 70,
        durationMs: 60000,
        characters: 20,
        source: "lesson",
      },
      {
        at: "2026-08-27T11:00:00.000Z",
        lessonId: "w1-home-fj",
        wpm: 20,
        accuracy: 1,
        consistency: null,
        durationMs: 30000,
        characters: 24,
        source: "lesson",
      },
    ]);
    expect(summary.averageWpm).toBe(15);
    expect(summary.bestWpm).toBe(20);
    expect(summary.averageAccuracy).toBe(0.95);
    expect(summary.characters).toBe(44);
    expect(summary.practiceMinutes).toBe(1.5);
  });
});

describe("empty snapshot", () => {
  it("starts with no attempt history", () => {
    expect(emptyProgressSnapshot().recentAttempts).toEqual([]);
    expect(emptyProgressSnapshot().daily).toEqual({});
  });
});
