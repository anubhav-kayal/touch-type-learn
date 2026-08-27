export const STAR_ACCURACY = {
  one: 0.9,
  two: 0.95,
  three: 0.98,
} as const;

export const STAR_CONSISTENCY_FOR_THREE = 70;

export const XP = {
  firstCompletion: 50,
  repeatCompletion: 15,
  accuracyHigh: 20,
  accuracyPerfect: 50,
  personalRecord: 30,
  bossFirst: 100,
} as const;

export const LEVEL_XP_BASE = 80;
export const LEVEL_XP_EXPONENT = 1.35;
