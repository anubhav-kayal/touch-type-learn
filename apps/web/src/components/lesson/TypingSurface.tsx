"use client";

import type { AssistanceLevel } from "@keypath/curriculum";
import { createTypingSession } from "@keypath/typing-engine";
import type { TypingSnapshot } from "@keypath/typing-engine";
import { fingerLabel, pressedKeyFromEventKey, VirtualKeyboard } from "@keypath/ui";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { applyLessonKeydown, shouldPreventDefault } from "@/lib/apply-lesson-keydown";
import { KeyboardNeededNotice } from "./KeyboardNeededNotice";
import { TypingPrompt } from "./TypingPrompt";

interface TypingSurfaceProps {
  prompt: string;
  inputMode: "forced-correction" | "free-flow";
  assistance?: AssistanceLevel;
  onComplete: (snapshot: TypingSnapshot) => void;
}

export function TypingSurface({
  prompt,
  inputMode,
  assistance = "full",
  onComplete,
}: TypingSurfaceProps) {
  const [session] = useState(() => createTypingSession({ expected: prompt, inputMode }));
  const [snapshot, setSnapshot] = useState<TypingSnapshot>(() => session.getSnapshot());
  const [pressedBaseKey, setPressedBaseKey] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    frameRef.current?.focus();
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (session.getSnapshot().isComplete) {
      return;
    }

    const action = applyLessonKeydown(session, event);
    if (shouldPreventDefault(action, event.key)) {
      event.preventDefault();
    }

    if (action === "ignored") {
      return;
    }

    setPressedBaseKey(pressedKeyFromEventKey(event.key));
    const next = session.getSnapshot();
    setSnapshot(next);
    if (next.isComplete) {
      onComplete(next);
    }
  }

  useEffect(() => {
    if (pressedBaseKey === null) {
      return;
    }
    const timer = window.setTimeout(() => setPressedBaseKey(null), 140);
    return () => window.clearTimeout(timer);
  }, [pressedBaseKey]);

  const finger = snapshot.currentFinger?.keyFinger ?? null;
  const targetLabel =
    snapshot.currentExpected === " "
      ? "Space"
      : (snapshot.currentExpected?.toUpperCase() ?? "");
  const showKeyboard =
    assistance === "full" ||
    assistance === "minimal" ||
    (assistance === "on-error" && snapshot.hasPendingError);

  return (
    <div
      ref={frameRef}
      tabIndex={0}
      role="group"
      aria-label="Typing lesson"
      data-testid="typing-surface"
      onKeyDown={onKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="flex w-full max-w-4xl flex-col items-center gap-10 rounded-3xl px-4 py-6 outline-none focus-visible:ring-2 focus-visible:ring-bump/70"
    >
      <TypingPrompt
        expected={snapshot.expected}
        statuses={snapshot.statuses}
        cursor={snapshot.cursor}
        isComplete={snapshot.isComplete}
      />

      <p className="font-mono text-sm tracking-[0.12em] text-legend uppercase" data-testid="finger-hint">
        {snapshot.hasPendingError
          ? "Backspace, then the highlighted key"
          : snapshot.currentExpected
            ? assistance === "full"
              ? `${targetLabel} · ${fingerLabel(finger)}`
              : targetLabel
            : "Done"}
      </p>

      {showKeyboard ? (
        <VirtualKeyboard
          targetGrapheme={snapshot.currentExpected}
          currentFinger={assistance === "full" ? snapshot.currentFinger : null}
          hasPendingError={snapshot.hasPendingError}
          pressedBaseKey={pressedBaseKey}
        />
      ) : null}

      {!focused ? (
        <p className="text-sm text-legend">Click this area, then type.</p>
      ) : null}

      <KeyboardNeededNotice />
    </div>
  );
}
