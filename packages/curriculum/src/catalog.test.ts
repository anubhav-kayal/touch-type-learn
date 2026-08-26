import { describe, expect, it } from "vitest";
import {
  BOTTOM_ROW_LETTERS,
  TOP_ROW_LETTERS,
  collectDisallowedGraphemes,
  getLesson,
  getWorlds,
  isLessonUnlocked,
  isTypingExercise,
  listPlayableLessons,
  WORLDS,
} from "./index";

describe("allowed keys", () => {
  it("flags letters outside the allowed set", () => {
    expect(collectDisallowedGraphemes("cat", ["c", "a"])).toEqual(["t"]);
  });

  it("allows space by default", () => {
    expect(collectDisallowedGraphemes("a b", ["a", "b"])).toEqual([]);
  });
});

describe("catalog invariants", () => {
  const playable = listPlayableLessons(getWorlds());

  it("registers eight worlds", () => {
    expect(WORLDS).toHaveLength(8);
    expect(WORLDS.map((world) => world.id)).toEqual([
      "world-1",
      "world-2",
      "world-3",
      "world-4",
      "world-5",
      "world-6",
      "world-7",
      "world-8",
    ]);
  });

  it("keeps every prompt inside allowedKeys", () => {
    const leaks: string[] = [];
    for (const lesson of playable) {
      for (const exercise of lesson.exercises) {
        if (!isTypingExercise(exercise)) {
          continue;
        }
        const disallowed = collectDisallowedGraphemes(
          exercise.prompt,
          lesson.allowedKeys,
        );
        if (disallowed.length > 0) {
          leaks.push(`${lesson.id}: ${disallowed.join(" ")}`);
        }
      }
    }
    expect(leaks).toEqual([]);
  });

  it("does not put top or bottom row letters in World 1", () => {
    const forbidden = new Set<string>([...TOP_ROW_LETTERS, ...BOTTOM_ROW_LETTERS]);
    const world1 = playable.filter((lesson) => lesson.worldId === "world-1");
    for (const lesson of world1) {
      for (const exercise of lesson.exercises) {
        if (!isTypingExercise(exercise)) {
          continue;
        }
        for (const grapheme of exercise.prompt) {
          if (grapheme === " ") {
            continue;
          }
          expect(forbidden.has(grapheme), `${lesson.id} leaked ${grapheme}`).toBe(
            false,
          );
        }
      }
    }
  });

  it("flags boss lessons", () => {
    expect(getLesson("w1-home-boss")?.isBoss).toBe(true);
    expect(getLesson("w2-boss")?.isBoss).toBe(true);
    expect(getLesson("w3-boss")?.isBoss).toBe(true);
  });

  it("leaves stub worlds without playable lessons", () => {
    expect(getWorlds().filter((world) => world.status === "stub")).toHaveLength(3);
    expect(playable.every((lesson) => lesson.worldId !== "world-6")).toBe(true);
  });
});

describe("unlocks", () => {
  const playable = listPlayableLessons(getWorlds());

  it("unlocks the first lesson with no stars", () => {
    expect(isLessonUnlocked("w1-orient", playable, {})).toBe(true);
    expect(isLessonUnlocked("w1-home-fj", playable, {})).toBe(false);
  });

  it("unlocks the next lesson at 1 star", () => {
    expect(isLessonUnlocked("w1-home-fj", playable, { "w1-orient": 1 })).toBe(true);
    expect(isLessonUnlocked("w1-home-fj", playable, { "w1-orient": 0 })).toBe(false);
  });
});
