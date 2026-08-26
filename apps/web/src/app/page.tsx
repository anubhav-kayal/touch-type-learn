import { ContinueLink } from "@/components/learn/ContinueLink";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col justify-between bg-desk px-8 py-10 text-ink">
      <p className="font-mono text-xs tracking-[0.22em] text-legend uppercase">
        Keypath
      </p>
      <div className="flex max-w-xl flex-col gap-6">
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
  );
}
