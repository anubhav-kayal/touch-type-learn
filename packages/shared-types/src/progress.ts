export interface GuestLessonProgress {
  stars: number;
  bestWpm: number;
  bestAccuracy: number;
  attemptCount: number;
  xpEarned: number;
}

export interface GuestKeyStat {
  key: string;
  attempts: number;
  correct: number;
  errors: number;
  averageLatencyMs: number | null;
}

export interface GuestStreak {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  practiceDaysMonth: number;
}

export type AchievementId =
  | "first-lesson"
  | "perfect-run"
  | "speed-40"
  | "speed-60"
  | "speed-100"
  | "home-row-hero"
  | "marathon"
  | "precision";

export type DailyChallengeId = "words-200" | "weak-keys-3" | "lessons-3" | "pb-60s";

export interface DailyChallengeState {
  date: string;
  challengeId: DailyChallengeId;
  progress: number;
  target: number;
  completed: boolean;
  xpAwarded: boolean;
}

export interface ProgressSnapshot {
  progress: Record<string, GuestLessonProgress>;
  xp: number;
  keyStats: Record<string, GuestKeyStat>;
  streak: GuestStreak;
  recentAttempts: AttemptPoint[];
  daily: Record<string, DailyBucket>;
  achievements: Record<string, string>;
  dailyChallenge: DailyChallengeState;
}

export interface AttemptPoint {
  at: string;
  lessonId: string | null;
  wpm: number;
  accuracy: number;
  consistency: number | null;
  durationMs: number;
  characters: number;
  source: "lesson" | "practice" | "word-rain";
}

export interface DailyBucket {
  date: string;
  practiceMinutes: number;
  characters: number;
  lessonsCompleted: number;
  xpEarned: number;
}

export interface GuestSnapshot extends ProgressSnapshot {
  version: 1;
}

export interface LessonAttemptPayload {
  lessonId: string;
  durationMs: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number | null;
  errors: number;
  correctedErrors: number;
  maxCombo: number;
  keyStats: Record<string, GuestKeyStat>;
}
