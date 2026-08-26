"use client";

import type { CharStatus } from "@keypath/typing-engine";

interface TypingPromptProps {
  expected: string[];
  statuses: CharStatus[];
  cursor: number;
  isComplete: boolean;
}

function slotClass(status: CharStatus, isCurrent: boolean): string {
  if (isCurrent && status === "incorrect") {
    return "text-incorrect underline decoration-2 underline-offset-8";
  }
  if (isCurrent) {
    return "text-ink";
  }
  if (status === "correct") {
    return "text-correct";
  }
  if (status === "incorrect") {
    return "text-incorrect underline decoration-2 underline-offset-4";
  }
  return "text-legend/55";
}

export function TypingPrompt({
  expected,
  statuses,
  cursor,
  isComplete,
}: TypingPromptProps) {
  return (
    <p
      className="flex flex-wrap justify-center gap-x-[0.12em] font-mono text-4xl tracking-[0.04em] sm:text-5xl"
      data-testid="typing-prompt"
    >
      {expected.map((grapheme, index) => {
        const status = statuses[index] ?? "pending";
        const isCurrent = !isComplete && index === cursor;
        const label = grapheme === " " ? "\u00A0" : grapheme;
        return (
          <span
            key={`${grapheme}-${index}`}
            data-status={
              isCurrent && status === "incorrect"
                ? "incorrect"
                : isCurrent
                  ? "current"
                  : status
            }
            data-current={isCurrent ? "true" : undefined}
            className={[
              "relative inline-flex min-w-[0.55em] justify-center",
              slotClass(status, isCurrent),
            ].join(" ")}
          >
            {label}
            {isCurrent ? (
              <span
                aria-hidden="true"
                className="absolute -bottom-2 left-1/2 h-1.5 w-3 -translate-x-1/2 rounded-full bg-bump"
              />
            ) : null}
          </span>
        );
      })}
    </p>
  );
}
