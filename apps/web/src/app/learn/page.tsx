import { ContinueLink } from "@/components/learn/ContinueLink";
import { CourseMapView } from "@/components/learn/CourseMapView";
import { ProgressHud } from "@/components/learn/ProgressHud";
import { AuthBar } from "@/components/auth/AuthBar";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Course map · Keypath",
};

export default function LearnMapPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-desk text-ink">
      <header className="flex items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-display text-sm tracking-wide text-legend hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bump"
        >
          Keypath
        </Link>
        <div className="flex items-center gap-5">
          <ContinueLink className="font-mono text-xs tracking-[0.18em] text-legend uppercase hover:text-ink">
            Continue
          </ContinueLink>
          <Link
            href="/practice"
            className="font-mono text-xs tracking-[0.18em] text-legend uppercase hover:text-ink"
          >
            Practice
          </Link>
          <AuthBar />
        </div>
      </header>
      <main className="mx-auto w-full max-w-xl flex-1 px-6 pb-16">
        <h1 className="mb-4 font-display text-4xl">Course map</h1>
        <ProgressHud />
        <CourseMapView />
      </main>
    </div>
  );
}
