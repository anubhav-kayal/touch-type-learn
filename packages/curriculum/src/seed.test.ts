import { describe, expect, it } from "vitest";
import { WORLDS } from "./catalog";
import { getLessonSeedRows, getWorldSeedRows, renderCurriculumSeedSql } from "./seed";

describe("curriculum seed", () => {
  it("covers every catalog world and lesson id", () => {
    expect(getWorldSeedRows().map((row) => row.id)).toEqual(WORLDS.map((world) => world.id));
    expect(getLessonSeedRows().map((row) => row.id)).toEqual(
      WORLDS.flatMap((world) => world.lessons.map((lesson) => lesson.id)),
    );
  });

  it("emits upsert SQL for worlds and playable lessons", () => {
    const sql = renderCurriculumSeedSql();
    expect(sql).toContain("insert into public.worlds");
    expect(sql).toContain("'world-1'");
    expect(sql).toContain("'w1-orient'");
    expect(sql).toContain("'w5-sentences'");
    expect(sql).toContain("'world-8'");
    expect(sql).not.toContain("w6-");
  });
});
