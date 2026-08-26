export type WorldId =
  | "world-1"
  | "world-2"
  | "world-3"
  | "world-4"
  | "world-5"
  | "world-6"
  | "world-7"
  | "world-8";

export const WORLD_IDS = [
  "world-1",
  "world-2",
  "world-3",
  "world-4",
  "world-5",
  "world-6",
  "world-7",
  "world-8",
] as const satisfies readonly WorldId[];

export type AssistanceLevel = "full" | "minimal" | "on-error" | "hidden";

export type WorldStatus = "full" | "partial" | "stub";

export type ExerciseType =
  | "introduction"
  | "key-drill"
  | "pattern"
  | "word"
  | "sentence"
  | "timed"
  | "challenge"
  | "boss";

export interface IntroductionExercise {
  type: "introduction";
  title: string;
  body: string;
}

export interface TypingExercise {
  type: Exclude<ExerciseType, "introduction">;
  prompt: string;
}

export type Exercise = IntroductionExercise | TypingExercise;

export interface Lesson {
  id: string;
  worldId: WorldId;
  title: string;
  description?: string;
  newKeys: string[];
  allowedKeys: string[];
  targetAccuracy: number;
  targetWpm?: number;
  assistance: AssistanceLevel;
  isBoss?: boolean;
  exercises: Exercise[];
}

export interface World {
  id: WorldId;
  title: string;
  description: string;
  sortOrder: number;
  status: WorldStatus;
  lessons: Lesson[];
}

export const PACKAGE_NAME = "@keypath/curriculum";

export const HOME_ROW_KEYS = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"] as const;
export const TOP_ROW_LETTERS = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"] as const;
export const BOTTOM_ROW_LETTERS = ["z", "x", "c", "v", "b", "n", "m"] as const;
