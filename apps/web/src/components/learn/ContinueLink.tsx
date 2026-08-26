"use client";

import type { ReactNode } from "react";
import {
  getCurrentLessonId,
  listPlayableLessons,
  getWorlds,
} from "@keypath/curriculum";
import Link from "next/link";
import { useLessonStars } from "@/hooks/use-lesson-stars";

interface ContinueLinkProps {
  className: string;
  children: ReactNode;
}

export function ContinueLink({ className, children }: ContinueLinkProps) {
  const stars = useLessonStars();
  const lessonId =
    getCurrentLessonId(listPlayableLessons(getWorlds()), stars) ?? "w1-orient";

  return (
    <Link href={`/learn/${lessonId}`} className={className}>
      {children}
    </Link>
  );
}
