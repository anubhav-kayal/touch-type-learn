"use server";

import { getLesson } from "@keypath/curriculum";
import {
  applyStreakOnPass,
  applyKeyStatDelta,
  calculateXp,
  emptyProgressSnapshot,
  levelFromXp,
  masteryForKeyStat,
  mergeGuestIntoAccount,
  utcDateString,
} from "@keypath/scoring";
import type {
  GuestKeyStat,
  GuestStreak,
  ProgressSnapshot,
} from "@keypath/shared-types";
import { validateAttemptPayload } from "@/lib/attempts/validate";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { parseGuestSnapshot } from "@/lib/guest-snapshot";
import type { Json } from "@/lib/supabase/database.types";

type ActionClient = Awaited<ReturnType<typeof createClient>>;

type ProgressResult = {
  ok: boolean;
  stars: Record<string, number>;
  xp: number;
  level: number;
  streak: GuestStreak;
  keyStats: Record<string, GuestKeyStat>;
};

function emptyProgressResult(ok = false): ProgressResult {
  return {
    ok,
    stars: {},
    xp: 0,
    level: 1,
    streak: emptyProgressSnapshot().streak,
    keyStats: {},
  };
}

async function requireUser() {
  if (!isSupabaseConfigured()) {
    return { error: "not_configured" as const, supabase: null, user: null };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "unauthenticated" as const, supabase, user: null };
  }
  return { error: null, supabase, user };
}

async function loadAccountSnapshot(
  supabase: ActionClient,
  userId: string,
): Promise<ProgressSnapshot> {
  const [{ data: profile }, { data: progressRows }, { data: keyRows }, { data: streakRow }] =
    await Promise.all([
      supabase.from("profiles").select("xp").eq("id", userId).maybeSingle(),
      supabase.from("user_progress").select("*").eq("user_id", userId),
      supabase.from("user_key_stats").select("*").eq("user_id", userId),
      supabase.from("streaks").select("*").eq("user_id", userId).maybeSingle(),
    ]);

  const snapshot = emptyProgressSnapshot();
  snapshot.xp = profile?.xp ?? 0;
  for (const row of progressRows ?? []) {
    snapshot.progress[row.lesson_id] = {
      stars: row.stars,
      bestWpm: Number(row.best_wpm),
      bestAccuracy: Number(row.best_accuracy),
      attemptCount: row.attempt_count,
      xpEarned: row.xp_earned,
    };
  }
  for (const row of keyRows ?? []) {
    snapshot.keyStats[row.key] = {
      key: row.key,
      attempts: row.attempts,
      correct: row.correct,
      errors: row.errors,
      averageLatencyMs: row.ema_latency_ms === null ? null : Number(row.ema_latency_ms),
    };
  }
  if (streakRow) {
    snapshot.streak = {
      currentStreak: streakRow.current_streak,
      longestStreak: streakRow.longest_streak,
      lastPracticeDate: streakRow.last_practice_date,
      practiceDaysMonth: streakRow.practice_days_month,
    };
  }
  return snapshot;
}

async function writeProgressSnapshot(
  supabase: ActionClient,
  userId: string,
  snapshot: ProgressSnapshot,
) {
  await supabase.from("profiles").update({
    xp: snapshot.xp,
    level: levelFromXp(snapshot.xp),
  }).eq("id", userId);

  const progressRows = Object.entries(snapshot.progress).map(([lessonId, row]) => ({
    user_id: userId,
    lesson_id: lessonId,
    stars: row.stars,
    best_wpm: row.bestWpm,
    best_accuracy: row.bestAccuracy,
    attempt_count: row.attemptCount,
    xp_earned: row.xpEarned,
    last_attempted_at: new Date().toISOString(),
  }));
  if (progressRows.length > 0) {
    await supabase.from("user_progress").upsert(progressRows, {
      onConflict: "user_id,lesson_id",
    });
  }

  const keyRows = Object.values(snapshot.keyStats).map((row) => ({
    user_id: userId,
    key: row.key,
    attempts: row.attempts,
    correct: row.correct,
    errors: row.errors,
    ema_latency_ms: row.averageLatencyMs,
    mastery_score: masteryForKeyStat(row),
    last_practiced_at: new Date().toISOString(),
  }));
  if (keyRows.length > 0) {
    await supabase.from("user_key_stats").upsert(keyRows, { onConflict: "user_id,key" });
  }

  await supabase.from("streaks").update({
    current_streak: snapshot.streak.currentStreak,
    longest_streak: snapshot.streak.longestStreak,
    last_practice_date: snapshot.streak.lastPracticeDate,
    practice_days_month: snapshot.streak.practiceDaysMonth,
  }).eq("user_id", userId);

  await supabase
    .from("user_progress")
    .update({ first_completed_at: new Date().toISOString() })
    .eq("user_id", userId)
    .gte("stars", 1)
    .is("first_completed_at", null);
}

function starsFromProgress(snapshot: ProgressSnapshot): Record<string, number> {
  const stars: Record<string, number> = {};
  for (const [lessonId, row] of Object.entries(snapshot.progress)) {
    if (row.stars > 0) {
      stars[lessonId] = row.stars;
    }
  }
  return stars;
}

async function upsertAttemptAggregates(
  supabase: ActionClient,
  userId: string,
  input: {
    lessonId: string;
    durationMs: number;
    wpm: number;
    accuracy: number;
    stars: number;
    xpEarned: number;
    keyStats: Record<string, GuestKeyStat>;
    passed: boolean;
    nextStreak: GuestStreak;
  },
) {
  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", input.lessonId)
    .maybeSingle();

  await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      lesson_id: input.lessonId,
      stars: Math.max(existing?.stars ?? 0, input.stars),
      best_wpm: Math.max(Number(existing?.best_wpm ?? 0), input.wpm),
      best_accuracy: Math.max(Number(existing?.best_accuracy ?? 0), input.accuracy),
      attempt_count: (existing?.attempt_count ?? 0) + 1,
      xp_earned: (existing?.xp_earned ?? 0) + input.xpEarned,
      first_completed_at:
        existing?.first_completed_at ??
        (input.stars >= 1 ? now : null),
      last_attempted_at: now,
    },
    { onConflict: "user_id,lesson_id" },
  );

  for (const stat of Object.values(input.keyStats)) {
    const { data: current } = await supabase
      .from("user_key_stats")
      .select("*")
      .eq("user_id", userId)
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
        user_id: userId,
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
  const characters = Object.values(input.keyStats).reduce((sum, row) => sum + row.attempts, 0);
  const { data: daily } = await supabase
    .from("daily_stats")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();
  await supabase.from("daily_stats").upsert(
    {
      user_id: userId,
      date: today,
      practice_minutes: Number(daily?.practice_minutes ?? 0) + input.durationMs / 60_000,
      characters: (daily?.characters ?? 0) + characters,
      lessons_completed: (daily?.lessons_completed ?? 0) + (input.passed ? 1 : 0),
      xp_earned: (daily?.xp_earned ?? 0) + input.xpEarned,
    },
    { onConflict: "user_id,date" },
  );

  if (input.passed) {
    await supabase.from("streaks").update({
      current_streak: input.nextStreak.currentStreak,
      longest_streak: input.nextStreak.longestStreak,
      last_practice_date: input.nextStreak.lastPracticeDate,
      practice_days_month: input.nextStreak.practiceDaysMonth,
    }).eq("user_id", userId);
  }
}

export async function submitLessonAttempt(input: unknown): Promise<{
  persisted: boolean;
  reason?: "not_configured" | "unauthenticated" | "invalid";
  error?: string;
  stars?: number;
}> {
  const validated = validateAttemptPayload(input);
  if (!validated.ok) {
    return { persisted: false, reason: "invalid", error: validated.error };
  }

  const auth = await requireUser();
  if (auth.error === "not_configured") {
    return { persisted: false, reason: "not_configured" };
  }
  if (auth.error === "unauthenticated" || !auth.user || !auth.supabase) {
    return { persisted: false, reason: "unauthenticated" };
  }

  const { payload, stars } = validated;
  const lesson = getLesson(payload.lessonId);
  if (!lesson) {
    return { persisted: false, reason: "invalid", error: "Unknown lesson." };
  }

  const [{ data: existing }, { data: profile }, { data: streakRow }] = await Promise.all([
    auth.supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", auth.user.id)
      .eq("lesson_id", payload.lessonId)
      .maybeSingle(),
    auth.supabase.from("profiles").select("xp").eq("id", auth.user.id).maybeSingle(),
    auth.supabase.from("streaks").select("*").eq("user_id", auth.user.id).maybeSingle(),
  ]);

  const awarded = calculateXp({
    stars,
    accuracy: payload.accuracy,
    wpm: payload.wpm,
    isBoss: Boolean(lesson.isBoss),
    previous: existing
      ? {
          stars: existing.stars,
          bestWpm: Number(existing.best_wpm),
          bestAccuracy: Number(existing.best_accuracy),
          attemptCount: existing.attempt_count,
        }
      : undefined,
  });

  const currentStreak: GuestStreak = {
    currentStreak: streakRow?.current_streak ?? 0,
    longestStreak: streakRow?.longest_streak ?? 0,
    lastPracticeDate: streakRow?.last_practice_date ?? null,
    practiceDaysMonth: streakRow?.practice_days_month ?? 0,
  };
  const passed = stars >= 1;
  const nextStreak = passed ? applyStreakOnPass(currentStreak) : currentStreak;
  const nextXp = (profile?.xp ?? 0) + awarded.total;

  const { error } = await auth.supabase.from("lesson_attempts").insert({
    user_id: auth.user.id,
    lesson_id: payload.lessonId,
    duration_ms: payload.durationMs,
    wpm: payload.wpm,
    raw_wpm: payload.rawWpm,
    accuracy: payload.accuracy,
    consistency: payload.consistency,
    errors: payload.errors,
    corrected_errors: payload.correctedErrors,
    max_combo: payload.maxCombo,
    xp_earned: awarded.total,
    stars,
    key_stats: payload.keyStats as unknown as Json,
  });
  if (error) {
    return { persisted: false, reason: "invalid", error: error.message };
  }

  await upsertAttemptAggregates(auth.supabase, auth.user.id, {
    lessonId: payload.lessonId,
    durationMs: payload.durationMs,
    wpm: payload.wpm,
    accuracy: payload.accuracy,
    stars,
    xpEarned: awarded.total,
    keyStats: payload.keyStats,
    passed,
    nextStreak,
  });

  await auth.supabase
    .from("profiles")
    .update({ xp: nextXp, level: levelFromXp(nextXp) })
    .eq("id", auth.user.id);

  return { persisted: true, stars };
}

function toProgressResult(snapshot: ProgressSnapshot): ProgressResult {
  return {
    ok: true,
    stars: starsFromProgress(snapshot),
    xp: snapshot.xp,
    level: levelFromXp(snapshot.xp),
    streak: snapshot.streak,
    keyStats: snapshot.keyStats,
  };
}

export async function migrateGuestProgress(rawGuest: unknown): Promise<
  ProgressResult & { error?: string }
> {
  const auth = await requireUser();
  if (auth.error || !auth.user || !auth.supabase) {
    return { ...emptyProgressResult(), error: auth.error ?? "unauthenticated" };
  }

  const guest = parseGuestSnapshot(rawGuest);
  const account = await loadAccountSnapshot(auth.supabase, auth.user.id);
  const merged = mergeGuestIntoAccount(account, guest);
  await writeProgressSnapshot(auth.supabase, auth.user.id, merged);

  for (const [lessonId, row] of Object.entries(guest.progress)) {
    if (!getLesson(lessonId)) {
      continue;
    }
    const existing = account.progress[lessonId];
    if (existing && existing.attemptCount > 0) {
      continue;
    }
    await auth.supabase.from("lesson_attempts").insert({
      user_id: auth.user.id,
      lesson_id: lessonId,
      duration_ms: 0,
      wpm: row.bestWpm,
      raw_wpm: row.bestWpm,
      accuracy: row.bestAccuracy,
      consistency: null,
      errors: 0,
      corrected_errors: 0,
      max_combo: 0,
      xp_earned: row.xpEarned,
      stars: row.stars,
      key_stats: {},
    });
  }

  return toProgressResult(merged);
}

export async function getMyProgress(): Promise<ProgressResult> {
  const auth = await requireUser();
  if (auth.error || !auth.user || !auth.supabase) {
    return emptyProgressResult();
  }
  const account = await loadAccountSnapshot(auth.supabase, auth.user.id);
  return toProgressResult(account);
}

export async function getMyProgressStars(): Promise<{
  ok: boolean;
  stars: Record<string, number>;
}> {
  const result = await getMyProgress();
  return { ok: result.ok, stars: result.stars };
}
