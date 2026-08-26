import type { Lesson, World } from "./types";

export function listPlayableLessons(worlds: readonly World[]): Lesson[] {
  return worlds.flatMap((world) => (world.status === "stub" ? [] : world.lessons));
}

export function isLessonUnlocked(
  lessonId: string,
  playable: readonly Lesson[],
  stars: Record<string, number>,
): boolean {
  const index = playable.findIndex((lesson) => lesson.id === lessonId);
  if (index <= 0) {
    return index === 0;
  }
  const previous = playable[index - 1];
  if (!previous) {
    return false;
  }
  return (stars[previous.id] ?? 0) >= 1;
}

export function getCurrentLessonId(
  playable: readonly Lesson[],
  stars: Record<string, number>,
): string | null {
  const next = playable.find((lesson) => (stars[lesson.id] ?? 0) < 1);
  return next?.id ?? playable[playable.length - 1]?.id ?? null;
}

export function getNextLessonId(
  lessonId: string,
  playable: readonly Lesson[],
): string | null {
  const index = playable.findIndex((lesson) => lesson.id === lessonId);
  if (index < 0) {
    return null;
  }
  return playable[index + 1]?.id ?? null;
}
