export type LessonId = string;
export type WorldId = string;

export interface LessonAttemptSummary {
  lessonId: LessonId;
  durationMs: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number | null;
  errors: number;
  correctedErrors: number;
  maxCombo: number;
  xpEarned: number;
  stars: number;
}

export const PACKAGE_NAME = "@keypath/shared-types";
