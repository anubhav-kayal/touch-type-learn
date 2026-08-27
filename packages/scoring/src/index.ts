export const PACKAGE_NAME = "@keypath/scoring";

export {
  STAR_ACCURACY,
  STAR_CONSISTENCY_FOR_THREE,
  XP,
  MIN_KEY_ATTEMPTS,
  MASTERY,
  WORD_RAIN_XP,
} from "./thresholds";
export { calculateStars } from "./calculateStars";
export { calculateXp, EMPTY_XP_BREAKDOWN } from "./calculateXp";
export type { CalculateXpInput, XpBreakdown } from "./calculateXp";
export { calculateWordRainXp } from "./calculateWordRainXp";
export { levelFromXp, xpProgressInLevel, xpRequiredToReach } from "./calculateLevel";
export { applyStreakOnPass } from "./applyStreak";
export { previousUtcDate, utcDateString } from "./utcDate";
export { calculateMastery, mergeLatencyEma } from "./calculateMastery";
export { applyKeyStatDelta, masteryForKeyStat } from "./applyKeyStatDelta";
export { eligiblePracticeKeys, pickWeakKeys, samplePracticeKey } from "./pickWeakKeys";
export type { PracticeKeyPick, RankedKey } from "./pickWeakKeys";
export {
  accountHasLessonProgress,
  emptyProgressSnapshot,
  emptyStreak,
  mergeGuestIntoAccount,
  mergeStreak,
  mergeDaily,
  mergeRecentAttempts,
  mergeAchievements,
  mergeDailyChallenge,
} from "./mergeGuest";
export {
  activitySeries,
  addDailyActivity,
  appendAttemptPoint,
  completedLessonCount,
  keyTable,
  lastAttempt,
  summarizeAttempts,
  todayBucket,
} from "./summarizeStats";
export {
  ACHIEVEMENTS,
  HOME_ROW_HERO_LESSON_ID,
  MARATHON_MINUTES,
  evaluateAchievements,
  getAchievement,
  isAchievementId,
} from "./achievements";
export type { AchievementDef, AchievementEvent, EvaluateAchievementsInput } from "./achievements";
export {
  DAILY_CHALLENGES,
  TIMED_PB_MS,
  applyDailyChallenge,
  challengeForUtcDate,
  dailyChallengeForNow,
  emptyDailyChallenge,
  formatDailyProgress,
  getDailyChallenge,
  isDailyChallengeId,
  maxTimedWpm,
} from "./dailyChallenge";
export type { DailyChallengeDef, DailyChallengeEvent } from "./dailyChallenge";
export { applyMetaProgress } from "./applyMetaProgress";
export type { ApplyMetaResult, MetaEvent } from "./applyMetaProgress";
