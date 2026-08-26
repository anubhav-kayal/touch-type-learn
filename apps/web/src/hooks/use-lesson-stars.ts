"use client";

import { useSyncExternalStore } from "react";
import { readStars, subscribeProgress } from "@/lib/lesson-progress";

export function useLessonStars(): Record<string, number> {
  return useSyncExternalStore(subscribeProgress, readStars, () => ({}));
}
