import type { GuestLessonProgress } from "@keypath/shared-types";
import { XP } from "./thresholds";

export interface XpBreakdown {
  completion: number;
  accuracy: number;
  personalRecord: number;
  boss: number;
  total: number;
}

export interface CalculateXpInput {
  stars: number;
  accuracy: number;
  wpm: number;
  isBoss: boolean;
  previous?: Pick<
    GuestLessonProgress,
    "stars" | "bestWpm" | "bestAccuracy" | "attemptCount"
  >;
}

export const EMPTY_XP_BREAKDOWN: XpBreakdown = {
  completion: 0,
  accuracy: 0,
  personalRecord: 0,
  boss: 0,
  total: 0,
};

function accuracyBonus(accuracy: number): number {
  if (accuracy >= 1) {
    return XP.accuracyPerfect;
  }
  if (accuracy >= 0.95) {
    return XP.accuracyHigh;
  }
  return 0;
}

export function calculateXp(input: CalculateXpInput): XpBreakdown {
  if (input.stars < 1) {
    return { ...EMPTY_XP_BREAKDOWN };
  }

  const previous = input.previous;
  const alreadyCleared = (previous?.stars ?? 0) >= 1;
  const completion = alreadyCleared ? XP.repeatCompletion : XP.firstCompletion;
  const accuracy = accuracyBonus(input.accuracy);

  const hadPriorAttempt = previous !== undefined && previous.attemptCount > 0;
  const improved =
    hadPriorAttempt &&
    (input.wpm > previous.bestWpm || input.accuracy > previous.bestAccuracy);
  const personalRecord = improved ? XP.personalRecord : 0;

  const boss =
    input.isBoss && !alreadyCleared ? XP.bossFirst : 0;

  return {
    completion,
    accuracy,
    personalRecord,
    boss,
    total: completion + accuracy + personalRecord + boss,
  };
}
