"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

export interface LessonResultView {
  accuracy: number;
  wpm: number;
  consistency: number | null;
  errors: number;
  maxCombo: number;
  stars: number;
}

interface ResultsCardProps {
  result: LessonResultView;
  nextLessonHref: string | null;
  passed: boolean;
  onRetry: () => void;
}

function formatAccuracy(accuracy: number): string {
  return `${Math.round(accuracy * 100)}%`;
}

function formatWpm(wpm: number): string {
  return wpm.toFixed(0);
}

export function ResultsCard({
  result,
  nextLessonHref,
  passed,
  onRetry,
}: ResultsCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
      className="flex w-full max-w-md flex-col items-stretch gap-8"
      aria-labelledby="lesson-results-heading"
      data-testid="lesson-results"
    >
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs tracking-[0.2em] text-legend uppercase">
          {passed ? "Lesson complete" : "Almost — try again"}
        </p>
        <h1 id="lesson-results-heading" className="font-display text-3xl text-ink">
          {passed ? "Accuracy first" : "Need 90% to continue"}
        </h1>
        <p className="text-sm text-legend" aria-label={`${result.stars} stars`}>
          {"★".repeat(result.stars)}
          {"☆".repeat(3 - result.stars)}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-4 font-mono">
        <div className="col-span-2 rounded-2xl bg-keycap px-5 py-4">
          <dt className="text-xs tracking-[0.18em] text-legend uppercase">Accuracy</dt>
          <dd className="font-display text-5xl text-ink">
            {formatAccuracy(result.accuracy)}
          </dd>
        </div>
        <div className="rounded-2xl bg-keycap px-5 py-4">
          <dt className="text-xs tracking-[0.18em] text-legend uppercase">WPM</dt>
          <dd className="text-2xl text-ink">{formatWpm(result.wpm)}</dd>
        </div>
        <div className="rounded-2xl bg-keycap px-5 py-4">
          <dt className="text-xs tracking-[0.18em] text-legend uppercase">
            Consistency
          </dt>
          <dd className="text-2xl text-ink">
            {result.consistency === null ? "—" : `${Math.round(result.consistency)}`}
          </dd>
        </div>
        <div className="rounded-2xl bg-keycap px-5 py-4">
          <dt className="text-xs tracking-[0.18em] text-legend uppercase">Errors</dt>
          <dd className="text-2xl text-ink">{result.errors}</dd>
        </div>
        <div className="rounded-2xl bg-keycap px-5 py-4">
          <dt className="text-xs tracking-[0.18em] text-legend uppercase">Best combo</dt>
          <dd className="text-2xl text-ink">{result.maxCombo}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3">
        {passed && nextLessonHref ? (
          <Link
            href={nextLessonHref}
            className="rounded-full bg-ink px-6 py-3 text-center font-display text-desk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump"
          >
            Next lesson
          </Link>
        ) : null}
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-ink/15 bg-keycap px-6 py-3 font-display text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump"
        >
          Try again
        </button>
        <Link
          href="/learn"
          className="text-center text-sm text-legend underline-offset-4 hover:text-ink hover:underline"
        >
          Course map
        </Link>
      </div>
    </motion.section>
  );
}
