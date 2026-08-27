"use client";

import { listPracticeModes } from "@keypath/curriculum";
import Link from "next/link";
import { AppHeader } from "@/components/shell/AppHeader";

export function PracticeHub() {
  const modes = listPracticeModes();
  const lead = modes.find((mode) => mode.id === "weak-keys");
  const rest = modes.filter((mode) => mode.id !== "weak-keys" && mode.id !== "custom");
  const custom = modes.find((mode) => mode.id === "custom");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-desk text-ink">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-10 px-6 pb-16">
        <header className="flex flex-col gap-3 pt-2">
          <p className="font-mono text-xs tracking-[0.2em] text-legend uppercase">Practice</p>
          <h1 className="font-display text-4xl">Extra mileage</h1>
          <p className="max-w-md text-legend">
            Learn is the path. These drills are extra passes on keys you already met — plus
            punctuation, numbers, and a paste box.
          </p>
        </header>

        {lead ? (
          <Link
            href={`/practice/${lead.id}`}
            className="flex flex-col gap-2 rounded-3xl bg-ink px-6 py-5 text-desk focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bump"
          >
            <p className="font-mono text-[0.65rem] tracking-[0.18em] uppercase text-desk/70">
              Start here
            </p>
            <h2 className="font-display text-3xl">{lead.title}</h2>
            <p className="text-desk/80">{lead.blurb}</p>
          </Link>
        ) : null}

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rest.map((mode) => (
            <li key={mode.id}>
              <Link
                href={`/practice/${mode.id}`}
                className="flex h-full flex-col gap-2 rounded-2xl bg-keycap px-5 py-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bump"
              >
                <h2 className="font-display text-2xl">{mode.title}</h2>
                <p className="text-sm text-legend">{mode.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>

        {custom ? (
          <Link
            href={`/practice/${custom.id}`}
            className="flex flex-col gap-2 rounded-2xl border border-ink/15 px-5 py-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bump"
          >
            <h2 className="font-display text-2xl">{custom.title}</h2>
            <p className="text-sm text-legend">{custom.blurb}</p>
          </Link>
        ) : null}
      </main>
    </div>
  );
}
