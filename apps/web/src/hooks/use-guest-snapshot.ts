"use client";

import { useSyncExternalStore } from "react";
import { emptyProgressSnapshot } from "@keypath/scoring";
import type { GuestSnapshot } from "@keypath/shared-types";
import { readGuestSnapshot, subscribeProgress } from "@/lib/guest-progress";

const EMPTY: GuestSnapshot = { version: 1, ...emptyProgressSnapshot() };
let cached: GuestSnapshot = EMPTY;
let cachedKey = "";

export function readGuestSnapshotStore(): GuestSnapshot {
  const next = readGuestSnapshot();
  const key = JSON.stringify(next);
  if (key === cachedKey) {
    return cached;
  }
  cachedKey = key;
  cached = next;
  return cached;
}

export function getServerGuestSnapshot(): GuestSnapshot {
  return EMPTY;
}

export function useGuestSnapshot(): GuestSnapshot {
  return useSyncExternalStore(
    subscribeProgress,
    readGuestSnapshotStore,
    getServerGuestSnapshot,
  );
}
