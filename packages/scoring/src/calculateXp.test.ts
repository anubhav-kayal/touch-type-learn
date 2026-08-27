import { describe, expect, it } from "vitest";
import { calculateXp } from "./calculateXp";
import { XP } from "./thresholds";

const firstClear = {
  stars: 1 as const,
  accuracy: 0.9,
  wpm: 18,
  isBoss: false,
};

describe("calculateXp", () => {
  it("awards nothing below 1 star", () => {
    expect(
      calculateXp({ stars: 0, accuracy: 0.89, wpm: 40, isBoss: true }).total,
    ).toBe(0);
  });

  it("awards first-clear XP without stacking a personal record", () => {
    expect(calculateXp(firstClear)).toEqual({
      completion: XP.firstCompletion,
      accuracy: 0,
      personalRecord: 0,
      boss: 0,
      total: 50,
    });
  });

  it("awards the 95% bonus on a first clear", () => {
    expect(calculateXp({ ...firstClear, accuracy: 0.95 }).total).toBe(70);
  });

  it("does not stack the 100% bonus with the 95% bonus", () => {
    const breakdown = calculateXp({ ...firstClear, accuracy: 1 });
    expect(breakdown.accuracy).toBe(XP.accuracyPerfect);
    expect(breakdown.total).toBe(100);
  });

  it("uses reduced XP on a repeat clear", () => {
    expect(
      calculateXp({
        ...firstClear,
        previous: { stars: 1, bestWpm: 18, bestAccuracy: 0.9, attemptCount: 1 },
      }).completion,
    ).toBe(XP.repeatCompletion);
  });

  it("adds a personal-record bonus when WPM or accuracy improves", () => {
    const previous = { stars: 1, bestWpm: 18, bestAccuracy: 0.9, attemptCount: 2 };
    expect(calculateXp({ ...firstClear, wpm: 22, previous }).personalRecord).toBe(
      XP.personalRecord,
    );
    expect(
      calculateXp({ ...firstClear, accuracy: 0.93, previous }).personalRecord,
    ).toBe(XP.personalRecord);
    expect(calculateXp({ ...firstClear, previous }).personalRecord).toBe(0);
  });

  it("adds boss XP only the first time the lesson is cleared", () => {
    expect(calculateXp({ ...firstClear, isBoss: true }).boss).toBe(XP.bossFirst);
    expect(
      calculateXp({
        ...firstClear,
        isBoss: true,
        previous: { stars: 1, bestWpm: 20, bestAccuracy: 0.92, attemptCount: 1 },
      }).boss,
    ).toBe(0);
  });
});
