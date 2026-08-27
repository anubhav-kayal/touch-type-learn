"use client";

import {
  ACHIEVEMENTS,
  activitySeries,
  completedLessonCount,
  keyTable,
  summarizeAttempts,
} from "@keypath/scoring";
import { AppHeader } from "@/components/shell/AppHeader";
import { ContinueLink } from "@/components/learn/ContinueLink";
import { StatsTrendChart } from "@/components/stats/StatsTrendChart";
import { useGuestSnapshot } from "@/hooks/use-guest-snapshot";

function formatMinutes(minutes: number): string {
  if (minutes < 1) {
    return minutes > 0 ? "<1 min" : "0 min";
  }
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

function dayLabel(date: string): string {
  return date.slice(8, 10);
}

export function StatsView() {
  const snapshot = useGuestSnapshot();
  const summary = summarizeAttempts(snapshot.recentAttempts);
  const lessons = completedLessonCount(snapshot);
  const dailyRows = Object.values(snapshot.daily);
  const practiceMinutes =
    dailyRows.reduce((sum, row) => sum + row.practiceMinutes, 0) || summary.practiceMinutes;
  const characters =
    dailyRows.reduce((sum, row) => sum + row.characters, 0) || summary.characters;
  const activity = activitySeries(snapshot.daily);
  const keys = keyTable(snapshot);
  const maxMinutes = Math.max(1, ...activity.map((row) => row.minutes));
  const empty = summary.attemptCount === 0 && lessons === 0 && characters === 0;

  if (empty) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-desk text-ink">
        <AppHeader />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 pb-16">
          <p className="font-mono text-xs tracking-[0.2em] text-legend uppercase">Stats</p>
          <h1 className="font-display text-4xl">No sessions yet</h1>
          <p className="max-w-md text-legend">
            Charts wait until you type. Start on the home row and come back after a lesson.
          </p>
          <ContinueLink className="w-fit rounded-full bg-ink px-6 py-3 font-display text-desk focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bump">
            Continue learning
          </ContinueLink>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-desk text-ink">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-10 px-6 pb-16">
        <header className="flex flex-col gap-2">
          <p className="font-mono text-xs tracking-[0.2em] text-legend uppercase">Stats</p>
          <h1 className="font-display text-4xl">How the last sessions went</h1>
          <p className="font-mono text-xs text-legend">
            Ink is WPM. Gold is accuracy. Not shown while you type.
          </p>
        </header>

        {summary.series.length > 0 ? <StatsTrendChart series={summary.series} /> : null}

        <dl className="grid grid-cols-2 gap-x-4 gap-y-5 font-mono sm:grid-cols-3">
          <LedgerStat
            label="Avg WPM"
            value={summary.averageWpm === null ? "—" : summary.averageWpm.toFixed(0)}
          />
          <LedgerStat label="Best WPM" value={summary.bestWpm.toFixed(0)} />
          <LedgerStat
            label="Accuracy"
            value={
              summary.averageAccuracy === null
                ? "—"
                : `${Math.round(summary.averageAccuracy * 100)}%`
            }
          />
          <LedgerStat
            label="Consistency"
            value={
              summary.averageConsistency === null
                ? "—"
                : summary.averageConsistency.toFixed(0)
            }
          />
          <LedgerStat label="Time" value={formatMinutes(practiceMinutes)} />
          <LedgerStat label="Characters" value={String(characters)} />
          <LedgerStat label="Lessons" value={String(lessons)} />
        </dl>

        <AchievementsList unlocked={snapshot.achievements} />

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl">Last 14 days</h2>
          <ol className="grid grid-cols-7 gap-2 sm:grid-cols-[repeat(14,minmax(0,1fr))]" data-testid="stats-activity">
            {activity.map((row) => {
              const fill = row.minutes <= 0 ? 0.08 : Math.min(1, 0.25 + (row.minutes / maxMinutes) * 0.75);
              return (
                <li key={row.date} className="flex flex-col items-center gap-1">
                  <span
                    title={`${row.date}: ${formatMinutes(row.minutes)}`}
                    className="block h-10 w-full rounded-md bg-ink"
                    style={{ opacity: fill }}
                  />
                  <span className="font-mono text-[0.65rem] text-legend">{dayLabel(row.date)}</span>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl">Keys</h2>
          {keys.length === 0 ? (
            <p className="text-sm text-legend">Key accuracy shows up after a few drills.</p>
          ) : (
            <table className="w-full text-left font-mono text-sm">
              <caption className="sr-only">Per-key attempts, accuracy, and mastery</caption>
              <thead>
                <tr className="text-[0.65rem] tracking-[0.18em] text-legend uppercase">
                  <th className="pb-2 font-normal">Key</th>
                  <th className="pb-2 font-normal">Hits</th>
                  <th className="pb-2 font-normal">Accuracy</th>
                  <th className="pb-2 font-normal">Mastery</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((row) => (
                  <tr key={row.key} className="border-t border-ink/10">
                    <td className="py-2 text-lg">{row.key === ";" ? ";" : row.key.toUpperCase()}</td>
                    <td className="py-2">{row.attempts}</td>
                    <td className="py-2">{Math.round(row.accuracy * 100)}%</td>
                    <td className="py-2">{Math.round(row.mastery)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}

function LedgerStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.65rem] tracking-[0.18em] text-legend uppercase">{label}</dt>
      <dd className="mt-1 text-2xl text-ink">{value}</dd>
    </div>
  );
}

function AchievementsList({ unlocked }: { unlocked: Record<string, string> }) {
  const rows = ACHIEVEMENTS.filter((row) => unlocked[row.id]);
  if (rows.length === 0) {
    return null;
  }
  return (
    <section className="flex flex-col gap-3" data-testid="achievements">
      <h2 className="font-display text-xl">Achievements</h2>
      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <li key={row.id} className="flex items-baseline justify-between gap-4 rounded-2xl bg-keycap px-4 py-3">
            <span>
              <span className="block text-ink">{row.title}</span>
              <span className="text-sm text-legend">{row.description}</span>
            </span>
            <span className="font-mono text-xs text-legend">+{row.xp}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
