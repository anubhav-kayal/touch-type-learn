import type { ProgressSnapshot } from "@keypath/shared-types";
import { evaluateAchievements, type AchievementDef } from "./achievements";
import { applyDailyChallenge } from "./dailyChallenge";
import { utcDateString } from "./utcDate";

export interface MetaEvent {
  lessonId?: string | null;
  stars: number;
  accuracy: number;
  wpm: number;
  durationMs: number;
  characters: number;
  source: "lesson" | "practice" | "word-rain";
  practiceMode?: string;
  priorTimedBestWpm?: number;
  now?: Date;
}

export interface ApplyMetaResult {
  snapshot: ProgressSnapshot;
  unlocked: AchievementDef[];
  dailyJustCompleted: boolean;
  dailyXp: number;
  achievementXp: number;
}

export function applyMetaProgress(
  snapshot: ProgressSnapshot,
  event: MetaEvent,
): ApplyMetaResult {
  const now = event.now ?? new Date();
  const today = utcDateString(now);
  const dailyResult = applyDailyChallenge(
    snapshot.dailyChallenge,
    {
      characters: event.characters,
      accuracy: event.accuracy,
      lessonPassed: event.source === "lesson" && event.stars >= 1,
      weakKeyDrill: event.practiceMode === "weak-keys",
      durationMs: event.durationMs,
      wpm: event.wpm,
      priorTimedBestWpm: event.priorTimedBestWpm ?? 0,
    },
    now,
  );

  const unlocked = evaluateAchievements({
    unlocked: Object.keys(snapshot.achievements),
    progress: snapshot.progress,
    event: {
      lessonId: event.lessonId,
      stars: event.stars,
      accuracy: event.accuracy,
      wpm: event.wpm,
      source: event.source,
    },
    practiceMinutesToday: snapshot.daily[today]?.practiceMinutes ?? 0,
  });

  const unlockedAt = now.toISOString();
  const achievements = { ...snapshot.achievements };
  let achievementXp = 0;
  for (const def of unlocked) {
    achievements[def.id] = unlockedAt;
    achievementXp += def.xp;
  }

  const extraXp = achievementXp + dailyResult.xp;
  const todayBucket = snapshot.daily[today];
  const daily =
    extraXp > 0 && todayBucket
      ? {
          ...snapshot.daily,
          [today]: { ...todayBucket, xpEarned: todayBucket.xpEarned + extraXp },
        }
      : snapshot.daily;

  return {
    snapshot: {
      ...snapshot,
      achievements,
      dailyChallenge: dailyResult.state,
      xp: snapshot.xp + extraXp,
      daily,
    },
    unlocked,
    dailyJustCompleted: dailyResult.justCompleted,
    dailyXp: dailyResult.xp,
    achievementXp,
  };
}
