"use client";

import { useSyncExternalStore } from "react";
import {
  getServerKeyStats,
  readKeyStats,
  subscribeProgress,
} from "@/lib/lesson-progress";

export function useKeyStats() {
  return useSyncExternalStore(subscribeProgress, readKeyStats, getServerKeyStats);
}
