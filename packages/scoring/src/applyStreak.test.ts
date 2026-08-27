import { describe, expect, it } from "vitest";
import { applyStreakOnPass } from "./applyStreak";
import { emptyStreak } from "./mergeGuest";
import { previousUtcDate } from "./utcDate";

describe("applyStreakOnPass", () => {
  it("starts a streak on the first passed lesson", () => {
    const now = new Date("2026-08-27T15:00:00.000Z");
    expect(applyStreakOnPass(emptyStreak(), now)).toEqual({
      currentStreak: 1,
      longestStreak: 1,
      lastPracticeDate: "2026-08-27",
      practiceDaysMonth: 1,
    });
  });

  it("does not increment twice on the same UTC day", () => {
    const morning = new Date("2026-08-27T01:00:00.000Z");
    const evening = new Date("2026-08-27T23:00:00.000Z");
    const once = applyStreakOnPass(emptyStreak(), morning);
    expect(applyStreakOnPass(once, evening)).toEqual(once);
  });

  it("increments when the previous pass was yesterday UTC, including overnight", () => {
    const late = new Date("2026-08-26T23:30:00.000Z");
    const earlyNext = new Date("2026-08-27T00:15:00.000Z");
    const first = applyStreakOnPass(emptyStreak(), late);
    expect(first.lastPracticeDate).toBe("2026-08-26");
    expect(previousUtcDate("2026-08-27")).toBe("2026-08-26");
    expect(applyStreakOnPass(first, earlyNext)).toEqual({
      currentStreak: 2,
      longestStreak: 2,
      lastPracticeDate: "2026-08-27",
      practiceDaysMonth: 2,
    });
  });

  it("quietly resets current after a skipped UTC day", () => {
    const started = applyStreakOnPass(emptyStreak(), new Date("2026-08-20T12:00:00.000Z"));
    const resumed = applyStreakOnPass(started, new Date("2026-08-27T12:00:00.000Z"));
    expect(resumed.currentStreak).toBe(1);
    expect(resumed.longestStreak).toBe(1);
    expect(resumed.lastPracticeDate).toBe("2026-08-27");
    expect(resumed.practiceDaysMonth).toBe(2);
  });

  it("keeps the streak across a month boundary and resets month days", () => {
    const august = applyStreakOnPass(emptyStreak(), new Date("2026-08-31T22:00:00.000Z"));
    const september = applyStreakOnPass(august, new Date("2026-09-01T02:00:00.000Z"));
    expect(september).toEqual({
      currentStreak: 2,
      longestStreak: 2,
      lastPracticeDate: "2026-09-01",
      practiceDaysMonth: 1,
    });
  });
});
