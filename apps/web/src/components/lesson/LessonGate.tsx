"use client";

import { isLessonUnlocked, listPlayableLessons, getWorlds } from "@keypath/curriculum";
import type { Lesson } from "@keypath/curriculum";
import Link from "next/link";
import { useLessonStars } from "@/hooks/use-lesson-stars";
import { LessonPlayer } from "./LessonPlayer";

export function LessonGate({ lesson }: { lesson: Lesson }) {
  const stars = useLessonStars();
  const playable = listPlayableLessons(getWorlds());
  const unlocked = isLessonUnlocked(lesson.id, playable, stars);

  if (!unlocked) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 bg-desk px-6 text-ink">
        <h1 className="font-display text-2xl">This lesson is locked</h1>
        <p className="max-w-sm text-center text-legend">
          Pass the previous lesson with at least 90% accuracy to continue.
        </p>
        <Link
          href="/learn"
          className="rounded-full bg-ink px-6 py-3 font-display text-desk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump"
        >
          Course map
        </Link>
      </div>
    );
  }

  return <LessonPlayer lesson={lesson} />;
}
