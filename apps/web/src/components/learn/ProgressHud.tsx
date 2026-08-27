"use client";

import { utcDateString } from "@keypath/scoring";
import { useProgressHud } from "@/hooks/use-progress-hud";

export function ProgressHud() {
  const hud = useProgressHud();
  const practicedToday = hud.lastPracticeDate === utcDateString();
  const streakLabel =
    hud.currentStreak >= 2
      ? `${hud.currentStreak} days in a row`
      : practicedToday
        ? "Practiced today"
        : null;

  return (
    <p
      className="mb-8 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs tracking-[0.16em] text-legend uppercase"
      data-testid="progress-hud"
    >
      <span>Level {hud.level}</span>
      <span>{hud.xp} XP</span>
      {streakLabel ? <span>{streakLabel}</span> : null}
    </p>
  );
}
