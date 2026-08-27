"use client";

import {
  COMMON_PRACTICE_WORDS,
  NUMBER_KEYS,
  PUNCTUATION_KEYS,
  generatePracticePrompt,
  getWorlds,
  listPlayableLessons,
  practiceAllowedKeys,
  prepareCustomPracticeText,
  wordsFittingKeys,
  type PracticeMode,
} from "@keypath/curriculum";
import { calculateAccuracy } from "@keypath/typing-engine";
import type { TypingSnapshot } from "@keypath/typing-engine";
import { masteryForKeyStat, pickWeakKeys } from "@keypath/scoring";
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

interface PracticePlayerProps {
  mode: PracticeMode;
}

export function PracticePlayer({ mode }: PracticePlayerProps) {
  const stars = useLessonStars();
  const keyStats = useKeyStats();
  const playable = useMemo(() => listPlayableLessons(getWorlds()), []);
  const unlockedKeys = useMemo(
    () => practiceAllowedKeys(playable, stars),
    [playable, stars],
  );
  const allowedKeys = useMemo(() => keysForMode(mode, unlockedKeys), [mode, unlockedKeys]);
  const ranked = useMemo(
    () =>
      Object.values(keyStats).map((row) => ({
        key: row.key,
        attempts: row.attempts,
        mastery: masteryForKeyStat(row),
      })),
    [keyStats],
  );
  const pick = useMemo(() => pickWeakKeys(ranked, unlockedKeys), [ranked, unlockedKeys]);

  const [view, setView] = useState<View>("ready");
  const [prompt, setPrompt] = useState("");
  const [runId, setRunId] = useState(0);
  const [customDraft, setCustomDraft] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);
  const [droppedNote, setDroppedNote] = useState<string | null>(null);
  const [result, setResult] = useState<{ accuracy: number; wpm: number } | null>(null);

  const blocked = blockedReason(mode, pick.focus, allowedKeys);

  function startGeneratedDrill() {
    const generated = generatePracticePrompt({
      modeId: mode.id,
      allowedKeys,
      focusKeys: pick.focus,
      exploreKeys: pick.explore,
    });
    if (!generated) {
      return;
    }
    setPrompt(generated);
    setDroppedNote(null);
    setResult(null);
    setView("drill");
    setRunId((id) => id + 1);
  }

  function startCustom() {
    const prepared = prepareCustomPracticeText(customDraft);
    if (!prepared.ok) {
      setCustomError(customErrorMessage(prepared.error));
      return;
    }
    setCustomError(null);
    setDroppedNote(
      prepared.dropped.length > 0
        ? `Removed ${prepared.dropped.length} character${prepared.dropped.length === 1 ? "" : "s"} that are not on US QWERTY.`
        : null,
    );
    setPrompt(prepared.prompt);
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
      wpm: snapshot.wpm,
      rawWpm: snapshot.rawWpm,
      accuracy,
      consistency: snapshot.consistency,
      errors: snapshot.errorKeystrokes,
      correctedErrors: snapshot.correctedErrors,
      maxCombo: snapshot.maxCombo,
      keyStats: keyStatsDelta,
    });
    setResult({
      accuracy,
      wpm: snapshot.wpm,
    });
    setView("results");
  }

  function again() {
    if (mode.id === "custom") {
      setView("ready");
      setPrompt("");
      return;
    }
    startGeneratedDrill();
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-desk text-ink">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-6 pb-16">
        {view === "ready" ? (
          <ReadyState
            mode={mode}
            focus={pick.focus}
            blocked={blocked}
            customDraft={customDraft}
            customError={customError}
            onCustomDraft={setCustomDraft}
            onStart={mode.id === "custom" ? startCustom : startGeneratedDrill}
          />
        ) : null}

        {view === "drill" && prompt ? (
          <div className="flex w-full flex-col items-center gap-4">
            <p className="font-mono text-xs tracking-[0.18em] text-legend uppercase">{mode.title}</p>
            {mode.id === "weak-keys" ? (
              <p className="font-mono text-sm text-legend" aria-label={`Focus keys ${pick.focus.join(" ")}`}>
                {pick.focus.map((key) => key.toUpperCase()).join(" · ")}
              </p>
            ) : null}
            {droppedNote ? <p className="text-sm text-legend">{droppedNote}</p> : null}
            <TypingSurface
              key={runId}
              prompt={prompt}
              inputMode={mode.inputMode}
              assistance={mode.assistance}
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
              <p className="mt-2 font-mono text-xs text-legend">No XP. Streak stays as it was.</p>
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
                onClick={again}
                className="rounded-full bg-ink px-6 py-3 font-display text-desk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump"
              >
                {mode.id === "custom" ? "Paste another" : "Another drill"}
              </button>
              <Link
                href="/practice"
                className="text-center text-sm text-legend underline-offset-4 hover:text-ink hover:underline"
              >
                All practice
              </Link>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function keysForMode(mode: PracticeMode, unlockedKeys: string[]): string[] {
  switch (mode.keySource) {
    case "unlocked":
      return unlockedKeys;
    case "punctuation":
      return [...PUNCTUATION_KEYS];
    case "numbers":
      return [...NUMBER_KEYS];
    case "custom":
      return [];
  }
}

function blockedReason(
  mode: PracticeMode,
  focus: string[],
  allowedKeys: string[],
): string | null {
  if (mode.id === "weak-keys" && focus.length === 0) {
    return "Complete more Learn lessons so we can see which keys need work. Practice stays inside keys you have already unlocked.";
  }
  if (mode.id === "common-words") {
    const usable = wordsFittingKeys(COMMON_PRACTICE_WORDS, allowedKeys).filter(
      (word) => word.length >= 2,
    );
    if (usable.length === 0) {
      return "Unlock more letters in Learn first. Common words need a bigger key set than F and J.";
    }
  }
  return null;
}

function customErrorMessage(error: "empty" | "too-long" | "no-typeable"): string {
  if (error === "too-long") {
    return "That paste is too long. Keep it under 400 characters, or 2,000 before cleaning.";
  }
  if (error === "no-typeable") {
    return "Nothing left after stripping characters that are not on US QWERTY.";
  }
  return "Paste some text first.";
}

function ReadyState({
  mode,
  focus,
  blocked,
  customDraft,
  customError,
  onCustomDraft,
  onStart,
}: {
  mode: PracticeMode;
  focus: string[];
  blocked: string | null;
  customDraft: string;
  customError: string | null;
  onCustomDraft: (value: string) => void;
  onStart: () => void;
}) {
  return (
    <div className="flex w-full max-w-md flex-col gap-6 pt-8">
      <Link
        href="/practice"
        className="font-mono text-xs tracking-[0.18em] text-legend uppercase hover:text-ink"
      >
        All practice
      </Link>
      <p className="font-mono text-xs tracking-[0.2em] text-legend uppercase">Practice</p>
      <h1 className="font-display text-4xl text-ink">{mode.id === "weak-keys" ? "Your weak keys" : mode.title}</h1>
      <p className="text-legend">{mode.blurb}</p>

      {mode.id === "weak-keys" && focus.length > 0 ? (
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
      ) : null}

      {blocked ? (
        <>
          <p className="text-legend">{blocked}</p>
          <Link
            href="/learn"
            className="w-fit rounded-full bg-ink px-6 py-3 font-display text-desk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump"
          >
            Continue learning
          </Link>
        </>
      ) : mode.id === "custom" ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            onStart();
          }}
        >
          <label className="flex flex-col gap-2">
            <span className="font-mono text-xs tracking-[0.18em] text-legend uppercase">
              Paste text
            </span>
            <textarea
              value={customDraft}
              onChange={(event) => onCustomDraft(event.target.value)}
              rows={6}
              className="resize-y rounded-2xl bg-keycap px-4 py-3 font-mono text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump"
            />
          </label>
          {customError ? <p className="text-sm text-incorrect">{customError}</p> : null}
          <button
            type="submit"
            className="w-fit rounded-full bg-ink px-6 py-3 font-display text-desk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump"
          >
            Start drill
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={onStart}
          className="w-fit rounded-full bg-ink px-6 py-3 font-display text-desk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump"
        >
          Start drill
        </button>
      )}
    </div>
  );
}
