import type { Lesson } from "./types";

export function defineLesson(
  lesson: Omit<Lesson, "targetAccuracy"> & { targetAccuracy?: number },
): Lesson {
  return {
    targetAccuracy: 0.9,
    ...lesson,
  };
}
