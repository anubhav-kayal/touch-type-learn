"use client";

import {
  generateWeakKeyDrill,
  getWorlds,
  listPlayableLessons,
  practiceAllowedKeys,
} from "@keypath/curriculum";
import { calculateAccuracy } from "@keypath/typing-engine";
import type { TypingSnapshot } from "@keypath/typing-engine";
import {
  masteryForKeyStat,
  pickWeakKeys,
} from "@keypath/scoring";
import Link from "next/link";
import { useMemo, useState } from "react";
import { submitPracticeAttempt } from "@/app/actions/practice";
import { TypingSurface } from "@/components/lesson/TypingSurface";
import { AppHeader } from "@/components/shell/AppHeader";
import { useKeyStats } from "@/hooks/use-key-stats";
import { useLessonStars } from "@/hooks/use-lesson-stars";
import { recordPracticeAttempt } from "@/lib/guest-progress";
import { snapshotKeyStats } from "@/lib/snapshot-key-stats";

type View = "ready" | "drill" | "results";

function nextPrompt(focus: string[], explore: string[], allowedKeys: string[]): string {
  return generateWeakKeyDrill({
    focusKeys: focus,
    exploreKeys: explore,
    allowedKeys,
  });
}

export function PracticePlayer() {
  const stars = useLessonStars();
  const keyStats = useKeyStats();
  const playable = useMemo(() => listPlayableLessons(getWorlds()), []);
  const allowedKeys = useMemo(() => practiceAllowedKeys(playable, stars), [playable, stars]);
  const ranked = useMemo(
    () =>
      Object.values(keyStats).map((row) => ({
        key: row.key,
        attempts: row.attempts,
        mastery: masteryForKeyStat(row),
      })),
    [keyStats],
  );
  const pick = useMemo(() => pickWeakKeys(ranked, allowedKeys), [ranked, allowedKeys]);

  const [view, setView] = useState<View>("ready");
  const [prompt, setPrompt] = useState("");
  const [runId, setRunId] = useState(0);
  const [result, setResult] = useState<{ accuracy: number; wpm: number } | null>(null);

  function startDrill() {
    const generated = nextPrompt(pick.focus, pick.explore, allowedKeys);
    if (!generated) {
      return;
    }
    setPrompt(generated);
    setResult(null);
    setView("drill");
    setRunId((id) => id + 1);
  }

  function onComplete(snapshot: TypingSnapshot) {
    const keyStatsDelta = snapshotKeyStats([snapshot]);
    const accuracy = calculateAccuracy(snapshot.correctKeystrokes, snapshot.errorKeystrokes);
    recordPracticeAttempt({
      wpm: snapshot.wpm,
      accuracy,
      durationMs: snapshot.durationMs,
      consistency: snapshot.consistency,
      keyStats: keyStatsDelta,
    });
    void submitPracticeAttempt({
      durationMs: snapshot.durationMs,
      keyStats: keyStatsDelta,
    });
    setResult({
      accuracy,
      wpm: snapshot.wpm,
    });
    setView("results");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-desk text-ink">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-6 pb-16">
        {view === "ready" ? (
          <ReadyState focus={pick.focus} onStart={startDrill} />
        ) : null}

        {view === "drill" && prompt ? (
          <div className="flex w-full flex-col items-center gap-4">
            <p className="font-mono text-xs tracking-[0.18em] text-legend uppercase">
              Weak keys
            </p>
            <p className="font-mono text-sm text-legend" aria-label={`Focus keys ${pick.focus.join(" ")}`}>
              {pick.focus.map((key) => key.toUpperCase()).join(" · ")}
            </p>
            <TypingSurface
              key={runId}
              prompt={prompt}
              inputMode="forced-correction"
              assistance="on-error"
              onComplete={onComplete}
            />
          </div>
        ) : null}

        {view === "results" && result ? (
          <section className="flex w-full max-w-md flex-col gap-8" data-testid="practice-results">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-legend uppercase">
                Practice complete
              </p>
              <h1 className="font-display text-3xl text-ink">Keys updated</h1>
            </div>
            <dl className="grid grid-cols-2 gap-4 font-mono">
              <div className="rounded-2xl bg-keycap px-5 py-4">
                <dt className="text-xs tracking-[0.18em] text-legend uppercase">Accuracy</dt>
                <dd className="font-display text-4xl text-ink">
                  {Math.round(result.accuracy * 100)}%
                </dd>
              </div>
              <div className="rounded-2xl bg-keycap px-5 py-4">
                <dt className="text-xs tracking-[0.18em] text-legend uppercase">WPM</dt>
                <dd className="text-2xl text-ink">{result.wpm.toFixed(0)}</dd>
              </div>
            </dl>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={startDrill}
                className="rounded-full bg-ink px-6 py-3 font-display text-desk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump"
              >
                Another drill
              </button>
              <Link
                href="/learn"
                className="text-center text-sm text-legend underline-offset-4 hover:text-ink hover:underline"
              >
                Course map
              </Link>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function ReadyState({
  focus,
  onStart,
}: {
  focus: string[];
  onStart: () => void;
}) {
  if (focus.length === 0) {
    return (
      <div className="flex max-w-md flex-col gap-6 pt-8">
        <p className="font-mono text-xs tracking-[0.2em] text-legend uppercase">Practice</p>
        <h1 className="font-display text-4xl text-ink">Your weak keys</h1>
        <p className="text-legend">
          Complete more Learn lessons so we can see which keys need work. Practice stays
          inside keys you have already unlocked.
        </p>
        <Link
          href="/learn"
          className="w-fit rounded-full bg-ink px-6 py-3 font-display text-desk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump"
        >
          Continue learning
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6 pt-8">
      <p className="font-mono text-xs tracking-[0.2em] text-legend uppercase">Practice</p>
      <h1 className="font-display text-4xl text-ink">Your weak keys</h1>
      <p className="text-legend">
        Drills stay on keys you have unlocked. These need the most work right now.
      </p>
      <ul className="flex flex-wrap gap-2" data-testid="weak-keys">
        {focus.map((key) => (
          <li
            key={key}
            className="rounded-xl bg-keycap px-3 py-2 font-mono text-lg text-ink"
          >
            {key === ";" ? ";" : key.toUpperCase()}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onStart}
        className="w-fit rounded-full bg-ink px-6 py-3 font-display text-desk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump"
      >
        Start drill
      </button>
    </div>
  );
}
