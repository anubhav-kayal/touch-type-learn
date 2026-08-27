"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AuthBar } from "@/components/auth/AuthBar";
import { ContinueLink } from "@/components/learn/ContinueLink";

interface AppHeaderProps {
  extra?: ReactNode;
}

export function AppHeader({ extra }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-5">
      <Link
        href="/"
        className="font-display text-sm tracking-wide text-legend hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bump"
      >
        Keypath
      </Link>
      <nav className="flex flex-wrap items-center justify-end gap-4 sm:gap-5">
        {extra}
        <ContinueLink className="font-mono text-xs tracking-[0.18em] text-legend uppercase hover:text-ink">
          Continue
        </ContinueLink>
        <Link
          href="/learn"
          className="font-mono text-xs tracking-[0.18em] text-legend uppercase hover:text-ink"
        >
          Map
        </Link>
        <Link
          href="/practice"
          className="font-mono text-xs tracking-[0.18em] text-legend uppercase hover:text-ink"
        >
          Practice
        </Link>
        <Link
          href="/play"
          className="font-mono text-xs tracking-[0.18em] text-legend uppercase hover:text-ink"
        >
          Play
        </Link>
        <Link
          href="/stats"
          className="font-mono text-xs tracking-[0.18em] text-legend uppercase hover:text-ink"
        >
          Stats
        </Link>
        <AuthBar />
      </nav>
    </header>
  );
}
