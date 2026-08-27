import { WORD_RAIN_XP } from "./thresholds";

export function calculateWordRainXp(input: {
  caught: number;
  missed: number;
  accuracy: number;
}): number {
  if (input.caught <= 0) {
    return 0;
  }
  let total = input.caught * WORD_RAIN_XP.perCatch;
  if (input.accuracy >= 1) {
    total += WORD_RAIN_XP.accuracyPerfect;
  } else if (input.accuracy >= 0.95) {
    total += WORD_RAIN_XP.accuracyHigh;
  }
  if (input.missed === 0 && input.caught >= 8) {
    total += WORD_RAIN_XP.noMissBonus;
  }
  return Math.min(WORD_RAIN_XP.cap, total);
}
