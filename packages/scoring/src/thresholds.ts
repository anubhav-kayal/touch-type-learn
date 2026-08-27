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

export const MIN_KEY_ATTEMPTS = 10;

export const MASTERY = {
  priorCorrect: 2,
  priorAttempts: 4,
  confidenceScale: 30,
  latencyFastMs: 180,
  latencySlowMs: 600,
  latencyNeutralUntilAttempts: 4,
  recencyEmaNew: 0.3,
  latencyEmaNew: 0.3,
  weights: {
    accuracy: 0.45,
    latency: 0.25,
    recency: 0.2,
    consistency: 0.1,
  },
} as const;

export const WEAK_KEY_TAKE_MIN = 3;
export const WEAK_KEY_TAKE_MAX = 5;
export const PRACTICE_EXPLORE_WEIGHT = 0.15;
