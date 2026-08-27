"use client";

import { useSyncExternalStore } from "react";
import {
  getServerProgressHud,
  readProgressHud,
  subscribeProgress,
} from "@/lib/lesson-progress";

export function useProgressHud() {
  return useSyncExternalStore(subscribeProgress, readProgressHud, getServerProgressHud);
}
