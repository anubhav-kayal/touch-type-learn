import { getLesson } from "@keypath/curriculum";
import { calculateStars } from "@keypath/scoring";
import type { GuestKeyStat, LessonAttemptPayload } from "@keypath/shared-types";

const MAX_DURATION_MS = 24 * 60 * 60 * 1000;
const MAX_KEY_STATS = 80;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function nonNegativeInt(value: unknown): number | null {
  const n = finiteNumber(value);
  if (n === null || n < 0 || !Number.isInteger(n)) {
    return null;
  }
  return n;
}

export function parseKeyStats(value: unknown): Record<string, GuestKeyStat> | null {
  if (!isRecord(value)) {
    return null;
  }
  const entries = Object.entries(value);
  if (entries.length > MAX_KEY_STATS) {
    return null;
  }
  const keyStats: Record<string, GuestKeyStat> = {};
  for (const [key, row] of entries) {
    if (!isRecord(row)) {
      return null;
    }
    const attempts = nonNegativeInt(row.attempts);
    const correct = nonNegativeInt(row.correct);
    const errors = nonNegativeInt(row.errors);
    if (attempts === null || correct === null || errors === null) {
      return null;
    }
    if (row.averageLatencyMs !== null && finiteNumber(row.averageLatencyMs) === null) {
      return null;
    }
    keyStats[key] = {
      key: typeof row.key === "string" ? row.key : key,
      attempts,
      correct,
      errors,
      averageLatencyMs:
        row.averageLatencyMs === null ? null : (finiteNumber(row.averageLatencyMs) as number),
    };
  }
  return keyStats;
}

export type AttemptValidation =
  | { ok: true; payload: LessonAttemptPayload; stars: 0 | 1 | 2 | 3 }
  | { ok: false; error: string };

export function validateAttemptPayload(input: unknown): AttemptValidation {
  if (!isRecord(input)) {
    return { ok: false, error: "Invalid attempt payload." };
  }
  if (typeof input.lessonId !== "string" || input.lessonId.length === 0) {
    return { ok: false, error: "Missing lesson." };
  }
  const lesson = getLesson(input.lessonId);
  if (!lesson) {
    return { ok: false, error: "Unknown lesson." };
  }

  const durationMs = nonNegativeInt(input.durationMs);
  const errors = nonNegativeInt(input.errors);
  const correctedErrors = nonNegativeInt(input.correctedErrors);
  const maxCombo = nonNegativeInt(input.maxCombo);
  const wpm = finiteNumber(input.wpm);
  const rawWpm = finiteNumber(input.rawWpm);
  const accuracy = finiteNumber(input.accuracy);
  const consistency =
    input.consistency === null ? null : finiteNumber(input.consistency);
  const keyStats = parseKeyStats(input.keyStats);

  if (
    durationMs === null ||
    durationMs > MAX_DURATION_MS ||
    errors === null ||
    correctedErrors === null ||
    maxCombo === null ||
    wpm === null ||
    wpm < 0 ||
    rawWpm === null ||
    rawWpm < 0 ||
    accuracy === null ||
    accuracy < 0 ||
    accuracy > 1 ||
    (consistency !== null && (consistency < 0 || consistency > 100)) ||
    keyStats === null
  ) {
    return { ok: false, error: "Attempt numbers are out of range." };
  }

  const stars = calculateStars(accuracy, consistency, {
    wpm,
    targetWpm: lesson.targetWpm,
  });

  return {
    ok: true,
    stars,
    payload: {
      lessonId: input.lessonId,
      durationMs,
      wpm,
      rawWpm,
      accuracy,
      consistency,
      errors,
      correctedErrors,
      maxCombo,
      keyStats,
    },
  };
}

export type PracticeValidation =
  | {
      ok: true;
      durationMs: number;
      wpm: number;
      rawWpm: number;
      accuracy: number;
      consistency: number | null;
      errors: number;
      correctedErrors: number;
      maxCombo: number;
      keyStats: Record<string, GuestKeyStat>;
      practiceMode?: "weak-keys";
    }
  | { ok: false; error: string };

export function validatePracticePayload(input: unknown): PracticeValidation {
  if (!isRecord(input)) {
    return { ok: false, error: "Invalid practice payload." };
  }
  const durationMs = nonNegativeInt(input.durationMs);
  const keyStats = parseKeyStats(input.keyStats);
  const wpm = finiteNumber(input.wpm) ?? 0;
  const rawWpm = finiteNumber(input.rawWpm) ?? wpm;
  const accuracy = finiteNumber(input.accuracy) ?? 0;
  const consistency =
    input.consistency === null || input.consistency === undefined
      ? null
      : finiteNumber(input.consistency);
  const errors = nonNegativeInt(input.errors) ?? 0;
  const correctedErrors = nonNegativeInt(input.correctedErrors) ?? 0;
  const maxCombo = nonNegativeInt(input.maxCombo) ?? 0;
  if (
    durationMs === null ||
    durationMs > MAX_DURATION_MS ||
    keyStats === null ||
    wpm < 0 ||
    rawWpm < 0 ||
    accuracy < 0 ||
    accuracy > 1 ||
    (consistency !== null && (consistency < 0 || consistency > 100))
  ) {
    return { ok: false, error: "Practice numbers are out of range." };
  }
  return {
    ok: true,
    durationMs,
    wpm,
    rawWpm,
    accuracy,
    consistency,
    errors,
    correctedErrors,
    maxCombo,
    keyStats,
    practiceMode: input.mode === "weak-keys" ? "weak-keys" : undefined,
  };
}

export type WordRainValidation =
  | (Extract<PracticeValidation, { ok: true }> & { caught: number; missed: number })
  | { ok: false; error: string };

export function validateWordRainPayload(input: unknown): WordRainValidation {
  const base = validatePracticePayload(input);
  if (!base.ok || !isRecord(input)) {
    return base.ok ? { ok: false, error: "Invalid Word Rain payload." } : base;
  }
  const caught = nonNegativeInt(input.caught);
  const missed = nonNegativeInt(input.missed);
  if (caught === null || missed === null || caught > 500 || missed > 50) {
    return { ok: false, error: "Word Rain numbers are out of range." };
  }
  return { ...base, caught, missed };
}
