"use client";

import {
  getNextLessonId,
  isTypingExercise,
  listPlayableLessons,
  getWorlds,
} from "@keypath/curriculum";
import type { Lesson } from "@keypath/curriculum";
import { calculateStars, calculateXp, EMPTY_XP_BREAKDOWN, levelFromXp } from "@keypath/scoring";
import { calculateAccuracy } from "@keypath/typing-engine";
import type { TypingSnapshot } from "@keypath/typing-engine";
import Link from "next/link";
import { useState } from "react";
import { submitLessonAttempt } from "@/app/actions/progress";
import { AuthBar } from "@/components/auth/AuthBar";
import { recordGuestAttempt, readGuestSnapshot } from "@/lib/guest-progress";
import { snapshotKeyStats } from "@/lib/snapshot-key-stats";
import { IntroCard } from "./IntroCard";
import { ResultsCard } from "./ResultsCard";
import type { LessonResultView } from "./ResultsCard";
import { TypingSurface } from "./TypingSurface";

interface LessonPlayerProps {
  lesson: Lesson;
}

type View = "exercise" | "results";

export function LessonPlayer({ lesson }: LessonPlayerProps) {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [runId, setRunId] = useState(0);
  const [snapshots, setSnapshots] = useState<TypingSnapshot[]>([]);
  const [view, setView] = useState<View>("exercise");
  const [result, setResult] = useState<LessonResultView | null>(null);

  const exercise = lesson.exercises[exerciseIndex];
  const playable = listPlayableLessons(getWorlds());
  const nextId = getNextLessonId(lesson.id, playable);

  function finishLesson(all: TypingSnapshot[]) {
    const correct = all.reduce((sum, item) => sum + item.correctKeystrokes, 0);
    const errors = all.reduce((sum, item) => sum + item.errorKeystrokes, 0);
    const last = all[all.length - 1];
    const accuracy = calculateAccuracy(correct, errors);
    const stars = calculateStars(accuracy, last?.consistency ?? null, {
      wpm: last?.wpm,
      targetWpm: lesson.targetWpm,
    });
    const keyStats = snapshotKeyStats(all);
    const previous = readGuestSnapshot().progress[lesson.id];
    const awarded =
      stars >= 1
        ? calculateXp({
            stars,
            accuracy,
            wpm: last?.wpm ?? 0,
            isBoss: Boolean(lesson.isBoss),
            previous: previous
              ? {
                  stars: previous.stars,
                  bestWpm: previous.bestWpm,
                  bestAccuracy: previous.bestAccuracy,
                  attemptCount: previous.attemptCount,
                }
              : undefined,
          })
        : EMPTY_XP_BREAKDOWN;
    const snapshot = recordGuestAttempt({
      lessonId: lesson.id,
      stars,
      wpm: last?.wpm ?? 0,
      accuracy,
      xpAwarded: awarded.total,
      keyStats,
    });
    void submitLessonAttempt({
      lessonId: lesson.id,
      durationMs: all.reduce((sum, item) => sum + item.durationMs, 0),
      wpm: last?.wpm ?? 0,
      rawWpm: last?.rawWpm ?? 0,
      accuracy,
      consistency: last?.consistency ?? null,
      errors,
      correctedErrors: all.reduce((sum, item) => sum + item.correctedErrors, 0),
      maxCombo: all.reduce((max, item) => Math.max(max, item.maxCombo), 0),
      keyStats,
    });
    setResult({
      accuracy,
      wpm: last?.wpm ?? 0,
      consistency: last?.consistency ?? null,
      errors,
      maxCombo: all.reduce((max, item) => Math.max(max, item.maxCombo), 0),
      stars,
      isBoss: Boolean(lesson.isBoss),
      xp: awarded,
      totalXp: snapshot.xp,
      level: levelFromXp(snapshot.xp),
      streakDays: snapshot.streak.currentStreak,
    });
    setView("results");
  }

  function onTypingComplete(snapshot: TypingSnapshot) {
    const all = [...snapshots, snapshot];
    const isLast = exerciseIndex >= lesson.exercises.length - 1;
    if (isLast) {
      finishLesson(all);
      return;
    }
    setSnapshots(all);
    setExerciseIndex(exerciseIndex + 1);
  }

  function continueIntro() {
    const isLast = exerciseIndex >= lesson.exercises.length - 1;
    if (isLast) {
      finishLesson(snapshots);
      return;
    }
    setExerciseIndex(exerciseIndex + 1);
  }

  function retry() {
    setExerciseIndex(0);
    setSnapshots([]);
    setResult(null);
    setView("exercise");
    setRunId((id) => id + 1);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-desk text-ink">
      <header className="flex items-center justify-between px-6 py-5">
        <Link
          href="/learn"
          className="font-display text-sm tracking-wide text-legend hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bump"
        >
          Keypath
        </Link>
        <div className="flex items-center gap-5">
          <p className="font-mono text-xs tracking-[0.18em] text-legend uppercase">
            {lesson.isBoss ? `Boss · ${lesson.title}` : lesson.title}
          </p>
          <Link
            href="/practice"
            className="font-mono text-xs tracking-[0.18em] text-legend uppercase hover:text-ink"
          >
            Practice
          </Link>
          <AuthBar />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
        {view === "results" && result ? (
          <ResultsCard
            result={result}
            passed={result.stars >= 1}
            nextLessonHref={
              result.stars >= 1 && nextId ? `/learn/${nextId}` : null
            }
            onRetry={retry}
          />
        ) : exercise?.type === "introduction" ? (
          <IntroCard
            key={`${runId}-${exerciseIndex}`}
            title={exercise.title}
            body={exercise.body}
            newKeys={lesson.newKeys}
            onContinue={continueIntro}
          />
        ) : exercise && isTypingExercise(exercise) ? (
          <div className="flex w-full flex-col items-center gap-4">
            <p className="font-mono text-xs tracking-[0.18em] text-legend uppercase">
              {exercise.type.replace("-", " ")}
            </p>
            <TypingSurface
              key={`${runId}-${exerciseIndex}`}
              prompt={exercise.prompt}
              inputMode="forced-correction"
              assistance={lesson.assistance}
              onComplete={onTypingComplete}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}
