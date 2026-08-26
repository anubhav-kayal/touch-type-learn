import { describe, expect, it } from "vitest";
import { calculateConsistency } from "./calculateConsistency";
import { CONSISTENCY_MIN_INTERVALS } from "./types";

describe("calculateConsistency", () => {
  it("returns null when there are too few intervals", () => {
    expect(calculateConsistency(Array.from({ length: 7 }, () => 200))).toBeNull();
  });

  it("scores even intervals at 100", () => {
    const even = Array.from({ length: CONSISTENCY_MIN_INTERVALS }, () => 200);
    expect(calculateConsistency(even)).toBe(100);
  });

  it("scores bursty intervals lower than even intervals", () => {
    const bursty = [50, 50, 50, 50, 400, 50, 50, 400];
    const even = Array.from({ length: 8 }, () => 200);
    const burstyScore = calculateConsistency(bursty);
    const evenScore = calculateConsistency(even);
    expect(burstyScore).not.toBeNull();
    expect(evenScore).toBe(100);
    expect(burstyScore as number).toBeLessThan(evenScore as number);
  });

  it("excludes pauses longer than 1500ms", () => {
    const withPause = [200, 200, 200, 2000, 200, 200, 200, 200, 200];
    expect(calculateConsistency(withPause)).toBe(100);
  });
});
