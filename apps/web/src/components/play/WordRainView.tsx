"use client";

import {
  getWorlds,
  listPlayableLessons,
  pickRainWords,
  practiceAllowedKeys,
} from "@keypath/curriculum";
import { calculateWordRainXp } from "@keypath/scoring";
import { fingerLabel } from "@keypath/ui";
import type { Finger } from "@keypath/typing-engine";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { submitWordRainAttempt } from "@/app/actions/play";
import { AppHeader } from "@/components/shell/AppHeader";
import { useLessonStars } from "@/hooks/use-lesson-stars";
import { recordWordRainAttempt } from "@/lib/guest-progress";
import {
  WordRainController,
  wordY,
  type FallingWord,
  type WordRainHud,
} from "@/lib/word-rain/controller";

type View = "ready" | "running" | "results";

interface RainResult {
  caught: number;
  missed: number;
  wpm: number;
  accuracy: number;
  xp: number;
}

export function WordRainView() {
  const stars = useLessonStars();
  const playable = useMemo(() => listPlayableLessons(getWorlds()), []);
  const allowedKeys = useMemo(
    () => practiceAllowedKeys(playable, stars),
    [playable, stars],
  );
  const pool = useMemo(() => pickRainWords(allowedKeys), [allowedKeys]);

  const controllerRef = useRef<WordRainController | null>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const savedRef = useRef(false);
  const [view, setView] = useState<View>("ready");
  const [hud, setHud] = useState<WordRainHud | null>(null);
  const [hint, setHint] = useState<{ letter: string; finger: Finger | null } | null>(null);
  const [result, setResult] = useState<RainResult | null>(null);
  const [runId, setRunId] = useState(0);

  function start() {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const controller = new WordRainController({
      pool,
      fallScale: reduceMotion ? 1.8 : 1,
    });
    controller.start();
    controllerRef.current = controller;
    savedRef.current = false;
    setHud(controller.hud());
    setHint(null);
    setResult(null);
    setView("running");
    setRunId((id) => id + 1);
  }

  function persist(controller: WordRainController) {
    if (savedRef.current) {
      return;
    }
    savedRef.current = true;
    const summary = controller.results();
    const xp = calculateWordRainXp({
      caught: summary.caught,
      missed: summary.missed,
      accuracy: summary.accuracy,
    });
    recordWordRainAttempt({
      wpm: summary.wpm,
      accuracy: summary.accuracy,
      durationMs: summary.durationMs,
      consistency: summary.consistency,
      keyStats: summary.keyStats,
      caught: summary.caught,
      missed: summary.missed,
      xpAwarded: xp,
    });
    void submitWordRainAttempt({
      durationMs: summary.durationMs,
      wpm: summary.wpm,
      rawWpm: summary.rawWpm,
      accuracy: summary.accuracy,
      consistency: summary.consistency,
      errors: summary.errors,
      correctedErrors: summary.correctedErrors,
      maxCombo: summary.maxCombo,
      keyStats: summary.keyStats,
      caught: summary.caught,
      missed: summary.missed,
    });
    setResult({
      caught: summary.caught,
      missed: summary.missed,
      wpm: summary.wpm,
      accuracy: summary.accuracy,
      xp,
    });
    setView("results");
  }

  useEffect(() => {
    if (view !== "running") {
      return;
    }
    const controller = controllerRef.current;
    const field = fieldRef.current;
    if (!controller || !field) {
      return;
    }

    let raf = 0;
    let paused = false;

    function paint(now: number) {
      const playfield = fieldRef.current;
      const game = controllerRef.current;
      if (!playfield || !game) {
        return;
      }
      const height = playfield.clientHeight;
      for (const node of playfield.querySelectorAll<HTMLElement>("[data-rain-id]")) {
        const id = node.dataset.rainId;
        const word = id ? game.wordById(id) : undefined;
        if (!word) {
          continue;
        }
        const y = Math.min(1, wordY(word, now));
        node.style.transform = `translate3d(0, ${y * height}px, 0)`;
      }
    }

    function loop(now: number) {
      const game = controllerRef.current;
      if (!game) {
        return;
      }
      if (paused) {
        raf = requestAnimationFrame(loop);
        return;
      }
      const events = game.tick(now);
      paint(now);
      if (events.missed.length > 0 || events.spawned) {
        setHud(game.hud());
      }
      if (game.hud().status === "over") {
        persist(game);
        return;
      }
      raf = requestAnimationFrame(loop);
    }

    function onVisibility() {
      paused = document.hidden;
    }

    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(loop);
    field.focus();
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [view, runId]);

  function syncHint(controller: WordRainController) {
    const snap = controller.lockedSnapshot();
    if (!snap?.currentExpected) {
      setHint(null);
      return;
    }
    setHint({
      letter: snap.currentExpected,
      finger: snap.currentFinger?.keyFinger ?? null,
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const controller = controllerRef.current;
    if (!controller || view !== "running") {
      return;
    }
    if (event.metaKey || event.ctrlKey || event.altKey || event.nativeEvent.isComposing) {
      return;
    }
    if (event.key === "Backspace") {
      event.preventDefault();
      const resultKind = controller.handleBackspace();
      if (resultKind.kind !== "ignored") {
        setHud(controller.hud());
        syncHint(controller);
      }
      return;
    }
    if (event.key.length !== 1) {
      return;
    }
    event.preventDefault();
    const outcome = controller.handleKey(event.key);
    if (outcome.kind === "ignored") {
      return;
    }
    setHud(controller.hud());
    syncHint(controller);
    if (controller.hud().status === "over") {
      persist(controller);
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-desk text-ink">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 pb-16">
        {view === "ready" ? (
          <div className="flex max-w-md flex-col gap-6 pt-8">
            <p className="font-mono text-xs tracking-[0.2em] text-legend uppercase">Play</p>
            <h1 className="font-display text-4xl">Word Rain</h1>
            <p className="text-legend">
              Words drop toward the home row. Type one to catch it before it hits the desk.
              Letters stay inside keys you have already unlocked.
            </p>
            {pool.length === 0 ? (
              <Link
                href="/learn"
                className="w-fit rounded-full bg-ink px-6 py-3 font-display text-desk focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bump"
              >
                Continue learning
              </Link>
            ) : (
              <button
                type="button"
                onClick={start}
                className="w-fit rounded-full bg-ink px-6 py-3 font-display text-desk focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bump"
              >
                Start rain
              </button>
            )}
          </div>
        ) : null}

        {view === "running" && hud ? (
          <div className="flex flex-1 flex-col gap-4 pt-2">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs tracking-[0.2em] text-legend uppercase">Word Rain</p>
                <p className="font-display text-2xl">{hud.caught} caught</p>
              </div>
              <ul className="flex gap-2" aria-label={`${hud.lives} lives left`}>
                {Array.from({ length: 3 }, (_, index) => (
                  <li
                    key={index}
                    className={`h-3 w-3 rounded-full ${index < hud.lives ? "bg-bump" : "bg-ink/20"}`}
                  />
                ))}
              </ul>
            </div>
            <div
              ref={fieldRef}
              tabIndex={0}
              role="application"
              aria-label="Word Rain playfield"
              onKeyDown={onKeyDown}
              className="relative min-h-[28rem] flex-1 overflow-hidden rounded-[2rem] bg-keycap outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bump"
            >
              <div className="pointer-events-none absolute inset-x-6 bottom-8 h-1 rounded-full bg-bump" />
              {hud.words.map((word) => (
                <RainGlyph
                  key={word.id}
                  word={word}
                  locked={word.id === hud.lockedId}
                  cursor={word.id === hud.lockedId ? hud.lockedCursor : 0}
                />
              ))}
            </div>
            <p className="font-mono text-sm text-legend">
              {hint
                ? `Next: ${hint.letter.toUpperCase()} · ${fingerLabel(hint.finger)}`
                : "Type the first letter of a falling word."}
            </p>
          </div>
        ) : null}

        {view === "results" && result ? (
          <section className="mx-auto flex w-full max-w-md flex-col gap-8 pt-10" data-testid="word-rain-results">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-legend uppercase">Rain over</p>
              <h1 className="font-display text-3xl">
                {result.caught === 0 ? "Nothing caught yet" : `Caught ${result.caught}`}
              </h1>
              <p className="mt-2 text-legend">
                {result.missed === 0
                  ? "Nothing reached the desk."
                  : `${result.missed} reached the desk.`}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-4 font-mono">
              <div className="rounded-2xl bg-keycap px-5 py-4">
                <dt className="text-xs tracking-[0.18em] text-legend uppercase">Accuracy</dt>
                <dd className="font-display text-4xl">{Math.round(result.accuracy * 100)}%</dd>
              </div>
              <div className="rounded-2xl bg-keycap px-5 py-4">
                <dt className="text-xs tracking-[0.18em] text-legend uppercase">WPM</dt>
                <dd className="text-2xl">{result.wpm.toFixed(0)}</dd>
              </div>
              <div className="rounded-2xl bg-keycap px-5 py-4">
                <dt className="text-xs tracking-[0.18em] text-legend uppercase">XP</dt>
                <dd className="text-2xl">+{result.xp}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={start}
              className="rounded-full bg-ink px-6 py-3 font-display text-desk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump"
            >
              Play again
            </button>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function RainGlyph({
  word,
  locked,
  cursor,
}: {
  word: FallingWord;
  locked: boolean;
  cursor: number;
}) {
  return (
    <p
      data-rain-id={word.id}
      className={`absolute top-0 font-mono text-2xl tracking-wide ${locked ? "text-bump" : "text-ink"}`}
      style={{ left: `${word.x * 100}%`, transform: "translate3d(0, 0, 0)" }}
    >
      {word.text.split("").map((letter, index) => (
        <span key={`${word.id}-${index}`} className={locked && index < cursor ? "opacity-40" : undefined}>
          {letter}
        </span>
      ))}
    </p>
  );
}
