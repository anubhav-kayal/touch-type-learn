"use server";

import {
  applyKeyStatDelta,
  applyStreakOnPass,
  calculateWordRainXp,
  levelFromXp,
  masteryForKeyStat,
  utcDateString,
} from "@keypath/scoring";
import type { GuestStreak } from "@keypath/shared-types";
import { validateWordRainPayload } from "@/lib/attempts/validate";
import { loadPriorTimedBestWpm, persistMetaAfterAttempt } from "@/lib/persist-meta";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export async function submitWordRainAttempt(input: unknown): Promise<{
  persisted: boolean;
  xp?: number;
  reason?: "not_configured" | "unauthenticated" | "invalid";
  error?: string;
}> {
  const validated = validateWordRainPayload(input);
  if (!validated.ok) {
    return { persisted: false, reason: "invalid", error: validated.error };
  }
  if (!isSupabaseConfigured()) {
    return { persisted: false, reason: "not_configured" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { persisted: false, reason: "unauthenticated" };
  }

  const xp = calculateWordRainXp({
    caught: validated.caught,
    missed: validated.missed,
    accuracy: validated.accuracy,
  });
  const priorTimedBestWpm = await loadPriorTimedBestWpm(supabase, user.id);

  const now = new Date().toISOString();
  const { error } = await supabase.from("lesson_attempts").insert({
    user_id: user.id,
    lesson_id: null,
    source: "word-rain",
    duration_ms: validated.durationMs,
    wpm: validated.wpm,
    raw_wpm: validated.rawWpm,
    accuracy: validated.accuracy,
    consistency: validated.consistency,
    errors: validated.errors,
    corrected_errors: validated.correctedErrors,
    max_combo: validated.maxCombo,
    xp_earned: xp,
    stars: 0,
    key_stats: validated.keyStats as unknown as Json,
  });
  if (error) {
    return { persisted: false, reason: "invalid", error: error.message };
  }

  for (const stat of Object.values(validated.keyStats)) {
    const { data: current } = await supabase
      .from("user_key_stats")
      .select("*")
      .eq("user_id", user.id)
      .eq("key", stat.key)
      .maybeSingle();
    const merged = applyKeyStatDelta(
      current
        ? {
            key: current.key,
            attempts: current.attempts,
            correct: current.correct,
            errors: current.errors,
            averageLatencyMs:
              current.ema_latency_ms === null ? null : Number(current.ema_latency_ms),
          }
        : undefined,
      stat,
    );
    await supabase.from("user_key_stats").upsert(
      {
        user_id: user.id,
        key: merged.key,
        attempts: merged.attempts,
        correct: merged.correct,
        errors: merged.errors,
        ema_latency_ms: merged.averageLatencyMs,
        mastery_score: masteryForKeyStat(merged),
        last_practiced_at: now,
      },
      { onConflict: "user_id,key" },
    );
  }

  const today = utcDateString();
  const characters = Object.values(validated.keyStats).reduce(
    (sum, row) => sum + row.attempts,
    0,
  );
  const { data: daily } = await supabase
    .from("daily_stats")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle();
  await supabase.from("daily_stats").upsert(
    {
      user_id: user.id,
      date: today,
      practice_minutes: Number(daily?.practice_minutes ?? 0) + validated.durationMs / 60_000,
      characters: (daily?.characters ?? 0) + characters,
      lessons_completed: daily?.lessons_completed ?? 0,
      xp_earned: (daily?.xp_earned ?? 0) + xp,
    },
    { onConflict: "user_id,date" },
  );

  if (validated.caught >= 1) {
    const { data: streakRow } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    const currentStreak: GuestStreak = {
      currentStreak: streakRow?.current_streak ?? 0,
      longestStreak: streakRow?.longest_streak ?? 0,
      lastPracticeDate: streakRow?.last_practice_date ?? null,
      practiceDaysMonth: streakRow?.practice_days_month ?? 0,
    };
    const nextStreak = applyStreakOnPass(currentStreak);
    await supabase.from("streaks").update({
      current_streak: nextStreak.currentStreak,
      longest_streak: nextStreak.longestStreak,
      last_practice_date: nextStreak.lastPracticeDate,
      practice_days_month: nextStreak.practiceDaysMonth,
    }).eq("user_id", user.id);
  }

  if (xp > 0) {
    const { data: profile } = await supabase.from("profiles").select("xp").eq("id", user.id).maybeSingle();
    const nextXp = (profile?.xp ?? 0) + xp;
    await supabase.from("profiles").update({
      xp: nextXp,
      level: levelFromXp(nextXp),
    }).eq("id", user.id);
  }

  await persistMetaAfterAttempt(supabase, user.id, {
    stars: 0,
    accuracy: validated.accuracy,
    wpm: validated.wpm,
    durationMs: validated.durationMs,
    characters,
    source: "word-rain",
    priorTimedBestWpm,
  });

  return { persisted: true, xp };
}
