import {
  getCurrentLessonId,
  getLesson,
  getWorld,
  getWorlds,
  listPlayableLessons,
} from "@keypath/curriculum";

export function getContinueTarget(stars: Record<string, number>): {
  lessonId: string;
  href: string;
  title: string;
  worldTitle: string;
} {
  const playable = listPlayableLessons(getWorlds());
  const lessonId = getCurrentLessonId(playable, stars) ?? "w1-orient";
  const lesson = getLesson(lessonId);
  const world = lesson ? getWorld(lesson.worldId) : undefined;
  return {
    lessonId,
    href: `/learn/${lessonId}`,
    title: lesson?.title ?? "Find the bumps",
    worldTitle: world?.title ?? "Finger Foundations",
  };
}
