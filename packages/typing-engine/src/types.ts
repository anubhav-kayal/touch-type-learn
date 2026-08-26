export const PACKAGE_NAME = "@keypath/typing-engine";

export const KEYBOARD_LAYOUT = "us-qwerty" as const;

export const WORD_CHAR_COUNT = 5;
export const MS_PER_MINUTE = 60_000;

export const CONSISTENCY_PAUSE_MS = 1500;
export const CONSISTENCY_MIN_INTERVALS = 8;
export const CONSISTENCY_CV_REF = 1;

export type InputMode = "forced-correction" | "free-flow";

export type CharStatus = "pending" | "correct" | "incorrect";

export type Finger =
  | "left_pinky"
  | "left_ring"
  | "left_middle"
  | "left_index"
  | "right_index"
  | "right_middle"
  | "right_ring"
  | "right_pinky"
  | "thumb";

export interface FingerAssignment {
  baseKey: string | null;
  keyFinger: Finger | null;
  shiftFinger: Finger | null;
  needsShift: boolean;
}

export interface KeyStatSummary {
  key: string;
  attempts: number;
  correct: number;
  errors: number;
  averageLatencyMs: number | null;
  substitutions: Record<string, number>;
}

export type NowFn = () => number;

export interface CreateSessionOptions {
  expected: string;
  inputMode?: InputMode;
  now?: NowFn;
}

export interface TypingSnapshot {
  expected: string[];
  statuses: CharStatus[];
  cursor: number;
  inputMode: InputMode;
  isComplete: boolean;
  hasPendingError: boolean;
  currentExpected: string | null;
  currentFinger: FingerAssignment | null;
  correctKeystrokes: number;
  errorKeystrokes: number;
  correctedErrors: number;
  combo: number;
  maxCombo: number;
  durationMs: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number | null;
  keyStats: Record<string, KeyStatSummary>;
}

export interface ManualClock {
  now: NowFn;
  advance: (ms: number) => void;
  set: (ms: number) => void;
}
