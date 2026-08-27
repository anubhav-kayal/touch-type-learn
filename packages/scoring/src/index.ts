export const PACKAGE_NAME = "@keypath/scoring";

export { STAR_ACCURACY, STAR_CONSISTENCY_FOR_THREE, XP } from "./thresholds";
export { calculateStars } from "./calculateStars";
export { calculateXp, EMPTY_XP_BREAKDOWN } from "./calculateXp";
export type { CalculateXpInput, XpBreakdown } from "./calculateXp";
export { levelFromXp, xpProgressInLevel, xpRequiredToReach } from "./calculateLevel";
export { applyStreakOnPass } from "./applyStreak";
export { previousUtcDate, utcDateString } from "./utcDate";
export {
  accountHasLessonProgress,
  emptyProgressSnapshot,
  emptyStreak,
  mergeGuestIntoAccount,
  mergeStreak,
} from "./mergeGuest";
