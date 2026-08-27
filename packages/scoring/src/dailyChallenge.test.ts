import { describe, expect, it } from "vitest";
import { XP } from "./thresholds";
import {
  applyDailyChallenge,
  challengeForUtcDate,
  emptyDailyChallenge,
  type DailyChallengeEvent,
} from "./dailyChallenge";

function dateForChallenge(
  id: ReturnType<typeof challengeForUtcDate>["id"],
): string {
  for (let day = 1; day <= 28; day += 1) {
    const date = `2026-04-${String(day).padStart(2, "0")}`;
    if (challengeForUtcDate(date).id === id) {
      return date;
    }
  }
  throw new Error(`No UTC date mapped to ${id}`);
}

const noop: DailyChallengeEvent = {
  characters: 0,
  accuracy: 0,
  lessonPassed: false,
  weakKeyDrill: false,
  durationMs: 0,
  wpm: 0,
  priorTimedBestWpm: 0,
};

describe("daily challenges", () => {
  it("picks a new challenge after UTC midnight and does not carry progress", () => {
    const date = "2026-08-27";
    const nextDate = "2026-08-28";
    const before = new Date(`${date}T23:59:59.000Z`);
    const after = new Date(`${nextDate}T00:00:00.000Z`);
    const event: DailyChallengeEvent =
      challengeForUtcDate(date).id === "lessons-3"
        ? { ...noop, lessonPassed: true }
        : challengeForUtcDate(date).id === "weak-keys-3"
          ? { ...noop, weakKeyDrill: true }
          : challengeForUtcDate(date).id === "words-200"
            ? { ...noop, characters: 50, accuracy: 0.96 }
            : { ...noop, durationMs: 60_000, wpm: 30, priorTimedBestWpm: 0 };

    const progressed = applyDailyChallenge(emptyDailyChallenge(date), event, before);
    expect(progressed.state.date).toBe(date);
    expect(progressed.state.progress).toBeGreaterThan(0);

    const rolled = applyDailyChallenge(progressed.state, noop, after);
    expect(rolled.state.date).toBe(nextDate);
    expect(rolled.state.challengeId).toBe(challengeForUtcDate(nextDate).id);
    expect(rolled.state.progress).toBe(0);
    expect(rolled.state.completed).toBe(false);
    expect(rolled.xp).toBe(0);
  });

  it("awards daily XP once when the challenge completes", () => {
    const date = dateForChallenge("lessons-3");
    const noon = new Date(`${date}T12:00:00.000Z`);
    let state = emptyDailyChallenge(date);
    let totalXp = 0;

    for (let i = 0; i < 4; i += 1) {
      const result = applyDailyChallenge(state, { ...noop, lessonPassed: true }, noon);
      state = result.state;
      totalXp += result.xp;
    }

    expect(state.completed).toBe(true);
    expect(state.xpAwarded).toBe(true);
    expect(state.progress).toBe(3);
    expect(totalXp).toBe(XP.dailyChallenge);
  });
});
