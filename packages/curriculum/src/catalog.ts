import type { Lesson, World } from "./types";
import { world1 } from "./worlds/world-1";
import { world2 } from "./worlds/world-2";
import { world3 } from "./worlds/world-3";
import { world4 } from "./worlds/world-4";
import { world5 } from "./worlds/world-5";
import { world6, world7, world8 } from "./worlds/stubs";

export const WORLDS: World[] = [
  world1,
  world2,
  world3,
  world4,
  world5,
  world6,
  world7,
  world8,
];

const LESSONS_BY_ID = new Map<string, Lesson>(
  WORLDS.flatMap((world) => world.lessons).map((lesson) => [lesson.id, lesson]),
);

export const LESSON_ALIASES: Record<string, string> = {
  "home-row": "w1-home-fj",
};

export function getWorlds(): World[] {
  return WORLDS;
}

export function getLesson(id: string): Lesson | undefined {
  const resolved = LESSON_ALIASES[id] ?? id;
  return LESSONS_BY_ID.get(resolved);
}

export function getWorld(id: string): World | undefined {
  return WORLDS.find((world) => world.id === id);
}
