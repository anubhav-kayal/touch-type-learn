"use client";

import {
  completedLessonCount,
  dailyChallengeForNow,
  formatDailyProgress,
  getDailyChallenge,
  lastAttempt,
  levelFromXp,
  pickWeakKeys,
  masteryForKeyStat,
  todayBucket,
  utcDateString,
} from "@keypath/scoring";
import {
  getWorlds,
  listPlayableLessons,
  practiceAllowedKeys,
} from "@keypath/curriculum";
import Link from "next/link";
import { AppHeader } from "@/components/shell/AppHeader";
import { ContinueLink } from "@/components/learn/ContinueLink";
import { useGuestSnapshot } from "@/hooks/use-guest-snapshot";
import { getContinueTarget } from "@/lib/continue-target";
import { starsFromSnapshot } from "@/lib/guest-snapshot";

export function HomeView() {
  const snapshot = useGuestSnapshot();
  const playable = listPlayableLessons(getWorlds());
  const stars = starsFromSnapshot(snapshot);
  const target = getContinueTarget(stars);
  const empty =
    completedLessonCount(snapshot) === 0 &&
    snapshot.xp === 0 &&
    snapshot.recentAttempts.length === 0;

  if (empty) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-desk text-ink">
        <AppHeader />
        <main className="flex flex-1 flex-col justify-between px-8 pb-10">
          <div className="flex max-w-xl flex-1 flex-col justify-center gap-6">
            <h1 className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              Find F and J.
              <br />
              Then never look down.
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-legend">
              Accuracy first. A structured path from the home row to real sentences,
              on a physical keyboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <ContinueLink className="w-fit rounded-full bg-ink px-6 py-3 font-display text-desk focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bump">
                Continue learning
              </ContinueLink>
              <Link
                href="/learn"
                className="w-fit rounded-full bg-keycap px-6 py-3 font-display text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bump"
              >
                Course map
              </Link>
            </div>
          </div>
          <p className="font-mono text-xs text-legend">World 1 · Finger Foundations</p>
        </main>
      </div>
    );
  }

  const completed = completedLessonCount(snapshot);
  const last = lastAttempt(snapshot.recentAttempts);
  const today = todayBucket(snapshot.daily);
  const allowed = practiceAllowedKeys(playable, stars);
  const weak = pickWeakKeys(
    Object.values(snapshot.keyStats).map((row) => ({
      key: row.key,
      attempts: row.attempts,
      mastery: masteryForKeyStat(row),
    })),
    allowed,
  ).focus;
  const practicedToday = snapshot.streak.lastPracticeDate === utcDateString();
  const daily = dailyChallengeForNow(snapshot.dailyChallenge);
  const dailyDef = getDailyChallenge(daily.challengeId);
  const streakLabel =
    snapshot.streak.currentStreak >= 2
      ? `${snapshot.streak.currentStreak} days in a row`
      : practicedToday
        ? "Practiced today"
        : null;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-desk text-ink">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-10 px-6 pb-16">
        <section className="flex flex-col gap-4">
          <p className="font-mono text-xs tracking-[0.2em] text-legend uppercase">
            {target.worldTitle}
          </p>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            Next: {target.title}
          </h1>
          <p className="font-mono text-xs text-legend">
            {completed} of {playable.length} lessons with a star
          </p>
          <ContinueLink className="w-fit rounded-full bg-ink px-6 py-3 font-display text-desk focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bump">
            Continue learning
          </ContinueLink>
        </section>

        <dl className="grid grid-cols-2 gap-3 font-mono sm:grid-cols-3">
          <DashStat label="Level" value={String(levelFromXp(snapshot.xp))} />
          <DashStat label="XP" value={String(snapshot.xp)} />
          <DashStat label="Streak" value={streakLabel ?? "—"} />
          <DashStat
            label="Last WPM"
            value={last ? last.wpm.toFixed(0) : "—"}
          />
          <DashStat
            label="Last accuracy"
            value={last ? `${Math.round(last.accuracy * 100)}%` : "—"}
          />
          <DashStat
            label="Today"
            value={
              today.practiceMinutes > 0
                ? `${Math.max(1, Math.round(today.practiceMinutes))} min`
                : practicedToday
                  ? "Practiced"
                  : "—"
            }
          />
        </dl>

        <section className="flex flex-col gap-3" data-testid="daily-challenge">
          <p className="font-mono text-xs tracking-[0.2em] text-legend uppercase">
            Daily · UTC
          </p>
          <h2 className="font-display text-xl">{dailyDef.title}</h2>
          <p className="text-sm text-legend">{dailyDef.description}</p>
          <p className="font-mono text-sm text-ink">{formatDailyProgress(daily)}</p>
          {daily.completed ? (
            <p className="font-mono text-xs text-legend">Done · +100 XP</p>
          ) : (
            <Link
              href={dailyDef.href}
              className="w-fit rounded-full bg-ink px-6 py-3 font-display text-desk focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bump"
            >
              {daily.challengeId === "weak-keys-3" ? "Practice weak keys" : "Continue learning"}
            </Link>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl">Weak keys</h2>
            <Link href="/practice" className="font-mono text-xs tracking-[0.18em] text-legend uppercase hover:text-ink">
              Practice
            </Link>
          </div>
          {weak.length === 0 ? (
            <p className="text-sm text-legend">
              Finish more Learn lessons and we will pick keys that need work.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {weak.map((key) => (
                <li key={key} className="rounded-xl bg-keycap px-3 py-2 font-mono text-lg">
                  {key === ";" ? ";" : key.toUpperCase()}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function DashStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-keycap px-4 py-3">
      <dt className="text-[0.65rem] tracking-[0.18em] text-legend uppercase">{label}</dt>
      <dd className="mt-1 text-lg text-ink">{value}</dd>
    </div>
  );
}
