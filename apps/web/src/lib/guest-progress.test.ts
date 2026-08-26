import { beforeEach, describe, expect, it } from "vitest";
import {
  LEGACY_PROGRESS_KEY,
  getServerStarsSnapshot,
  parseGuestSnapshot,
  readGuestSnapshot,
  readStars,
  recordStars,
  starsFromSnapshot,
} from "@/lib/guest-progress";

const memory = new Map<string, string>();

beforeEach(() => {
  memory.clear();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
      removeItem: (key: string) => {
        memory.delete(key);
      },
      clear: () => memory.clear(),
    },
  });
});

describe("guest snapshot", () => {
  it("migrates keypath.progress.v1 stars into guest.v1", () => {
    window.localStorage.setItem(
      LEGACY_PROGRESS_KEY,
      JSON.stringify({ version: 1, stars: { "w1-orient": 2, "w1-home-fj": 1 } }),
    );

    expect(readStars()).toEqual({ "w1-orient": 2, "w1-home-fj": 1 });
    expect(readGuestSnapshot().progress["w1-orient"]?.stars).toBe(2);
    expect(window.localStorage.getItem(LEGACY_PROGRESS_KEY)).toBeNull();
  });

  it("keeps the best stars when recording a weaker retry", () => {
    recordStars("w1-orient", 2);
    recordStars("w1-orient", 1);
    expect(readStars()["w1-orient"]).toBe(2);
    expect(readGuestSnapshot().progress["w1-orient"]?.attemptCount).toBe(2);
  });

  it("treats a stars-only payload as a guest snapshot", () => {
    const parsed = parseGuestSnapshot({
      version: 1,
      stars: { "w1-orient": 1 },
    });
    expect(starsFromSnapshot(parsed)).toEqual({ "w1-orient": 1 });
  });

  it("returns a stable snapshot for useSyncExternalStore", () => {
    expect(getServerStarsSnapshot()).toBe(getServerStarsSnapshot());
    expect(readStars()).toBe(readStars());
    recordStars("w1-orient", 1);
    expect(readStars()).toBe(readStars());
  });
});
