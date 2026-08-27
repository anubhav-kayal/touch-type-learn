import { isLessonUnlocked } from "./progress";
import type { Lesson } from "./types";

export function practiceAllowedKeys(
  playable: readonly Lesson[],
  stars: Record<string, number>,
): string[] {
  let allowed: string[] = [];
  for (const lesson of playable) {
    if (isLessonUnlocked(lesson.id, playable, stars)) {
      allowed = [...lesson.allowedKeys];
    }
  }
  if (allowed.length === 0 && playable[0]) {
    return [...playable[0].allowedKeys];
  }
  return allowed;
}
