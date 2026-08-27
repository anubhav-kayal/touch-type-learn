import { describe, expect, it } from "vitest";
import {
  evaluateAchievements,
  HOME_ROW_HERO_LESSON_ID,
  MARATHON_MINUTES,
} from "./achievements";

const lessonEvent = {
  lessonId: "w1-orient",
  stars: 1,
  accuracy: 0.92,
  wpm: 18,
  source: "lesson" as const,
};

describe("evaluateAchievements", () => {
  it("unlocks Home Row Hero only after the World 1 boss has a star", () => {
    expect(
      evaluateAchievements({
        unlocked: [],
        progress: { "w1-home-fj": { stars: 3 } },
        event: { ...lessonEvent, lessonId: "w1-home-fj", stars: 3 },
        practiceMinutesToday: 0,
      }).map((row) => row.id),
    ).not.toContain("home-row-hero");

    const unlocked = evaluateAchievements({
      unlocked: [],
      progress: { [HOME_ROW_HERO_LESSON_ID]: { stars: 1 } },
      event: {
        lessonId: HOME_ROW_HERO_LESSON_ID,
        stars: 1,
        accuracy: 0.93,
        wpm: 22,
        source: "lesson",
      },
      practiceMinutesToday: 0,
    }).map((row) => row.id);

    expect(unlocked).toContain("home-row-hero");
    expect(unlocked).toContain("first-lesson");
  });

  it("returns nothing when the same snapshot is evaluated twice", () => {
    const first = evaluateAchievements({
      unlocked: [],
      progress: { [HOME_ROW_HERO_LESSON_ID]: { stars: 1 } },
      event: {
        lessonId: HOME_ROW_HERO_LESSON_ID,
        stars: 1,
        accuracy: 1,
        wpm: 100,
        source: "lesson",
      },
      practiceMinutesToday: MARATHON_MINUTES,
    });
    expect(first.map((row) => row.id)).toEqual([
      "first-lesson",
      "perfect-run",
      "speed-40",
      "speed-60",
      "speed-100",
      "home-row-hero",
      "marathon",
    ]);

    const second = evaluateAchievements({
      unlocked: first.map((row) => row.id),
      progress: { [HOME_ROW_HERO_LESSON_ID]: { stars: 1 } },
      event: {
        lessonId: HOME_ROW_HERO_LESSON_ID,
        stars: 1,
        accuracy: 1,
        wpm: 100,
        source: "lesson",
      },
      practiceMinutesToday: MARATHON_MINUTES,
    });
    expect(second).toEqual([]);
  });
});
