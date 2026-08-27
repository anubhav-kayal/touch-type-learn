import {
  applyMetaProgress,
  emptyDailyChallenge,
  emptyProgressSnapshot,
  getDailyChallenge,
  isAchievementId,
  isDailyChallengeId,
  levelFromXp,
  utcDateString,
  type MetaEvent,
  type ApplyMetaResult,
} from "@keypath/scoring";
import type { ProgressSnapshot } from "@keypath/shared-types";
import { createClient } from "@/lib/supabase/server";

type Db = Awaited<ReturnType<typeof createClient>>;

export async function loadPriorTimedBestWpm(supabase: Db, userId: string): Promise<number> {
  const { data } = await supabase
    .from("lesson_attempts")
    .select("wpm")
    .eq("user_id", userId)
    .gte("duration_ms", 60_000)
    .order("wpm", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? Number(data.wpm) : 0;
}

export async function loadMetaIntoSnapshot(
  supabase: Db,
  userId: string,
  snapshot: ProgressSnapshot,
  now: Date = new Date(),
): Promise<void> {
  const today = utcDateString(now);
  const [{ data: achievementRows }, { data: challengeRow }] = await Promise.all([
    supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at")
      .eq("user_id", userId),
    supabase
      .from("user_daily_challenges")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle(),
  ]);

  snapshot.achievements = {};
  for (const row of achievementRows ?? []) {
    if (isAchievementId(row.achievement_id)) {
      snapshot.achievements[row.achievement_id] = row.unlocked_at;
    }
  }

  if (challengeRow && isDailyChallengeId(challengeRow.challenge_id)) {
    const def = getDailyChallenge(challengeRow.challenge_id);
    snapshot.dailyChallenge = {
      date: challengeRow.date,
      challengeId: def.id,
      progress: Number(challengeRow.progress),
      target: Number(challengeRow.target),
      completed: challengeRow.completed,
      xpAwarded: challengeRow.xp_awarded,
    };
  } else {
    snapshot.dailyChallenge = emptyDailyChallenge(today);
  }
}

export async function writeMetaTables(
  supabase: Db,
  userId: string,
  snapshot: ProgressSnapshot,
): Promise<void> {
  const achievementRows = Object.entries(snapshot.achievements)
    .filter(([id]) => isAchievementId(id))
    .map(([id, unlockedAt]) => ({
      user_id: userId,
      achievement_id: id,
      unlocked_at: unlockedAt,
    }));
  if (achievementRows.length > 0) {
    await supabase.from("user_achievements").upsert(achievementRows, {
      onConflict: "user_id,achievement_id",
    });
  }

  const daily = snapshot.dailyChallenge;
  if (daily.date < "2020-01-01") {
    return;
  }
  const def = getDailyChallenge(daily.challengeId);
  await supabase.from("daily_challenges").upsert({
    date: daily.date,
    challenge_id: def.id,
    title: def.title,
    description: def.description,
  });
  await supabase.from("user_daily_challenges").upsert(
    {
      user_id: userId,
      date: daily.date,
      challenge_id: def.id,
      progress: daily.progress,
      target: daily.target,
      completed: daily.completed,
      xp_awarded: daily.xpAwarded,
    },
    { onConflict: "user_id,date" },
  );
}

export async function persistMetaAfterAttempt(
  supabase: Db,
  userId: string,
  event: MetaEvent,
): Promise<ApplyMetaResult> {
  const now = event.now ?? new Date();
  const today = utcDateString(now);
  const snapshot = emptyProgressSnapshot();

  const [
    { data: progressRows },
    { data: dailyRow },
    { data: profile },
  ] = await Promise.all([
    supabase.from("user_progress").select("lesson_id, stars").eq("user_id", userId),
    supabase
      .from("daily_stats")
      .select("practice_minutes, xp_earned")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle(),
    supabase.from("profiles").select("xp").eq("id", userId).maybeSingle(),
  ]);

  for (const row of progressRows ?? []) {
    snapshot.progress[row.lesson_id] = {
      stars: row.stars,
      bestWpm: 0,
      bestAccuracy: 0,
      attemptCount: 0,
      xpEarned: 0,
    };
  }
  snapshot.xp = profile?.xp ?? 0;
  if (dailyRow) {
    snapshot.daily[today] = {
      date: today,
      practiceMinutes: Number(dailyRow.practice_minutes),
      characters: 0,
      lessonsCompleted: 0,
      xpEarned: dailyRow.xp_earned,
    };
  }

  await loadMetaIntoSnapshot(supabase, userId, snapshot, now);
  const result = applyMetaProgress(snapshot, { ...event, now });
  await writeMetaTables(supabase, userId, result.snapshot);

  const extraXp = result.achievementXp + result.dailyXp;
  if (extraXp > 0) {
    await supabase
      .from("profiles")
      .update({
        xp: result.snapshot.xp,
        level: levelFromXp(result.snapshot.xp),
      })
      .eq("id", userId);

    if (dailyRow) {
      await supabase
        .from("daily_stats")
        .update({ xp_earned: dailyRow.xp_earned + extraXp })
        .eq("user_id", userId)
        .eq("date", today);
    }
  }

  return result;
}
