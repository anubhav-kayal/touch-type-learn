"use client";

import {
  getCurrentLessonId,
  isLessonUnlocked,
  listPlayableLessons,
} from "@keypath/curriculum";
import type { World } from "@keypath/curriculum";
import Link from "next/link";

interface CourseMapProps {
  worlds: World[];
  stars: Record<string, number>;
}

export function CourseMap({ worlds, stars }: CourseMapProps) {
  const playable = listPlayableLessons(worlds);
  const currentId = getCurrentLessonId(playable, stars);

  return (
    <ol className="flex flex-col gap-10" data-testid="course-map">
      {worlds.map((world) => (
        <li key={world.id} className="flex flex-col gap-4">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-legend uppercase">
              World {world.sortOrder}
              {world.status === "stub" ? " · soon" : null}
            </p>
            <h2 className="font-display text-2xl text-ink">{world.title}</h2>
            <p className="max-w-md text-sm text-legend">{world.description}</p>
          </div>
          {world.status === "stub" ? (
            <p className="rounded-2xl bg-keycap px-4 py-3 text-sm text-legend">
              Locked until earlier worlds are built out.
            </p>
          ) : (
            <ol className="relative flex flex-col gap-2 border-l border-ink/10 pl-5">
              {world.lessons.map((lesson) => {
                const unlocked = isLessonUnlocked(lesson.id, playable, stars);
                const earned = stars[lesson.id] ?? 0;
                const complete = earned >= 1;
                const current = lesson.id === currentId;
                const label = lesson.isBoss ? `🏆 ${lesson.title}` : lesson.title;
                const status = !unlocked
                  ? "locked"
                  : current
                    ? "current"
                    : complete
                      ? "complete"
                      : "open";

                const inner = (
                  <span className="flex items-center justify-between gap-3">
                    <span>{label}</span>
                    <span className="font-mono text-xs text-legend" aria-hidden="true">
                      {complete ? "★".repeat(earned) : unlocked ? "○" : "–"}
                    </span>
                  </span>
                );

                return (
                  <li key={lesson.id}>
                    {unlocked ? (
                      <Link
                        href={`/learn/${lesson.id}`}
                        data-status={status}
                        className={[
                          "block rounded-xl px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump",
                          current
                            ? "bg-bump/25 font-medium text-ink"
                            : complete
                              ? "text-correct"
                              : "text-ink hover:bg-keycap",
                        ].join(" ")}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <p
                        data-status="locked"
                        className="rounded-xl px-3 py-2 text-sm text-legend/70"
                      >
                        {inner} <span className="sr-only">(locked)</span>
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </li>
      ))}
    </ol>
  );
}
