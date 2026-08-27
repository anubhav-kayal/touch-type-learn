import type { AchievementId, GuestLessonProgress } from "@keypath/shared-types";

export const HOME_ROW_HERO_LESSON_ID = "w1-home-boss";
export const MARATHON_MINUTES = 15;

export interface AchievementDef {
  id: AchievementId;
  title: string;
  description: string;
  xp: number;
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  {
    id: "first-lesson",
    title: "First star",
    description: "Pass any lesson with 90% accuracy.",
    xp: 25,
  },
  {
    id: "perfect-run",
    title: "Perfect run",
    description: "Finish a lesson with 100% accuracy.",
    xp: 40,
  },
  {
    id: "speed-40",
    title: "40 WPM",
    description: "Reach 40 WPM on any session.",
    xp: 20,
  },
  {
    id: "speed-60",
    title: "60 WPM",
    description: "Reach 60 WPM on any session.",
    xp: 40,
  },
  {
    id: "speed-100",
    title: "100 WPM",
    description: "Reach 100 WPM on any session.",
    xp: 80,
  },
  {
    id: "home-row-hero",
    title: "Home Row Hero",
    description: "Pass the World 1 boss.",
    xp: 100,
  },
  {
    id: "marathon",
    title: "Marathon",
    description: "Practice 15 minutes in one UTC day.",
    xp: 50,
  },
  {
    id: "precision",
    title: "Precision",
    description: "Earn three stars on a lesson.",
    xp: 40,
  },
];

const ACHIEVEMENT_BY_ID = new Map(ACHIEVEMENTS.map((row) => [row.id, row]));

export function getAchievement(id: string): AchievementDef | undefined {
  return ACHIEVEMENT_BY_ID.get(id as AchievementId);
}

export function isAchievementId(value: string): value is AchievementId {
  return ACHIEVEMENT_BY_ID.has(value as AchievementId);
}

export interface AchievementEvent {
  lessonId?: string | null;
  stars: number;
  accuracy: number;
  wpm: number;
  source: "lesson" | "practice" | "word-rain";
}

export interface EvaluateAchievementsInput {
  unlocked: Iterable<string>;
  progress: Record<string, Pick<GuestLessonProgress, "stars">>;
  event?: AchievementEvent;
  practiceMinutesToday: number;
}

function hasStar(progress: EvaluateAchievementsInput["progress"]): boolean {
  return Object.values(progress).some((row) => row.stars >= 1);
}

export function evaluateAchievements(input: EvaluateAchievementsInput): AchievementDef[] {
  const unlocked = new Set(input.unlocked);
  const earned: AchievementDef[] = [];

  function take(id: AchievementId, ok: boolean) {
    if (!ok || unlocked.has(id)) {
      return;
    }
    const def = getAchievement(id);
    if (!def) {
      return;
    }
    unlocked.add(id);
    earned.push(def);
  }

  take("first-lesson", hasStar(input.progress) || (input.event?.stars ?? 0) >= 1);
  take(
    "perfect-run",
    input.event?.source === "lesson" &&
      (input.event.stars >= 1) &&
      input.event.accuracy >= 1,
  );
  take("speed-40", (input.event?.wpm ?? 0) >= 40);
  take("speed-60", (input.event?.wpm ?? 0) >= 60);
  take("speed-100", (input.event?.wpm ?? 0) >= 100);
  take(
    "home-row-hero",
    (input.progress[HOME_ROW_HERO_LESSON_ID]?.stars ?? 0) >= 1,
  );
  take("marathon", input.practiceMinutesToday >= MARATHON_MINUTES);
  take("precision", input.event?.source === "lesson" && input.event.stars >= 3);

  return earned;
}
