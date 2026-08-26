import { WORLDS } from "./catalog";
import type { WorldStatus } from "./types";

export interface WorldSeedRow {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  status: WorldStatus;
}

export interface LessonSeedRow {
  id: string;
  worldId: string;
  title: string;
  sortOrder: number;
  isBoss: boolean;
  targetAccuracy: number;
  targetWpm: number | null;
}

export function getWorldSeedRows(): WorldSeedRow[] {
  return WORLDS.map((world) => ({
    id: world.id,
    title: world.title,
    description: world.description,
    sortOrder: world.sortOrder,
    status: world.status,
  }));
}

export function getLessonSeedRows(): LessonSeedRow[] {
  return WORLDS.flatMap((world) =>
    world.lessons.map((lesson, index) => ({
      id: lesson.id,
      worldId: lesson.worldId,
      title: lesson.title,
      sortOrder: index,
      isBoss: Boolean(lesson.isBoss),
      targetAccuracy: lesson.targetAccuracy,
      targetWpm: lesson.targetWpm ?? null,
    })),
  );
}

function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

export function renderCurriculumSeedSql(): string {
  const worlds = getWorldSeedRows()
    .map(
      (world) =>
        `  (${sqlString(world.id)}, ${sqlString(world.title)}, ${sqlString(world.description)}, ${world.sortOrder}, ${sqlString(world.status)})`,
    )
    .join(",\n");

  const lessons = getLessonSeedRows()
    .map(
      (lesson) =>
        `  (${sqlString(lesson.id)}, ${sqlString(lesson.worldId)}, ${sqlString(lesson.title)}, ${lesson.sortOrder}, ${lesson.isBoss}, ${lesson.targetAccuracy}, ${lesson.targetWpm === null ? "null" : lesson.targetWpm})`,
    )
    .join(",\n");

  return `-- Generated from packages/curriculum. Do not edit by hand.
-- Keep in sync with renderCurriculumSeedSql().

insert into public.worlds (id, title, description, sort_order, status)
values
${worlds}
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order,
  status = excluded.status;

insert into public.lessons (id, world_id, title, sort_order, is_boss, target_accuracy, target_wpm)
values
${lessons}
on conflict (id) do update set
  world_id = excluded.world_id,
  title = excluded.title,
  sort_order = excluded.sort_order,
  is_boss = excluded.is_boss,
  target_accuracy = excluded.target_accuracy,
  target_wpm = excluded.target_wpm;
`;
}
