export const PACKAGE_NAME = "@keypath/scoring";

export { STAR_ACCURACY, STAR_CONSISTENCY_FOR_THREE } from "./thresholds";
export { calculateStars } from "./calculateStars";
export {
  accountHasLessonProgress,
  emptyProgressSnapshot,
  emptyStreak,
  mergeGuestIntoAccount,
  mergeStreak,
} from "./mergeGuest";
