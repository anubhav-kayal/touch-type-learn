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

export interface ProgressSnapshot {
  progress: Record<string, GuestLessonProgress>;
  xp: number;
  keyStats: Record<string, GuestKeyStat>;
  streak: GuestStreak;
  recentAttempts: AttemptPoint[];
  daily: Record<string, DailyBucket>;
}

export interface AttemptPoint {
  at: string;
  lessonId: string | null;
  wpm: number;
  accuracy: number;
  consistency: number | null;
  durationMs: number;
  characters: number;
  source: "lesson" | "practice";
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
