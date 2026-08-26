"use client";

import Link from "next/link";
import { useCallback } from "react";
import type { TypingSnapshot } from "@keypath/typing-engine";
import { FIXTURE_LESSON } from "@/lessons/fixture";
import { useLessonUiStore } from "@/stores/lesson-ui";
import { ResultsCard } from "./ResultsCard";
import { TypingSurface } from "./TypingSurface";

export function LessonPlayer() {
  const view = useLessonUiStore((state) => state.view);
  const result = useLessonUiStore((state) => state.result);
  const runId = useLessonUiStore((state) => state.runId);
  const showResults = useLessonUiStore((state) => state.showResults);
  const retry = useLessonUiStore((state) => state.retry);

  const onComplete = useCallback(
    (snapshot: TypingSnapshot) => {
      showResults(snapshot);
    },
    [showResults],
  );

  return (
    <div className="flex min-h-full flex-1 flex-col bg-desk text-ink">
      <header className="flex items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-display text-sm tracking-wide text-legend hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bump"
        >
          Keypath
        </Link>
        <p className="font-mono text-xs tracking-[0.18em] text-legend uppercase">
          {FIXTURE_LESSON.title}
        </p>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
        {view === "results" && result ? (
          <ResultsCard result={result} onRetry={retry} />
        ) : (
          <TypingSurface
            key={runId}
            prompt={FIXTURE_LESSON.prompt}
            inputMode={FIXTURE_LESSON.inputMode}
            onComplete={onComplete}
          />
        )}
      </main>
    </div>
  );
}
