import { describe, expect, it } from "vitest";
import { calculateMastery } from "./calculateMastery";

describe("calculateMastery", () => {
  it("stays low at n=3 even with 100% hits and fast latency", () => {
    const mastery = calculateMastery({
      attempts: 3,
      correct: 3,
      averageLatencyMs: 160,
      recencyAccuracy: 1,
    });
    expect(mastery).toBeLessThan(15);
    expect(mastery).toBeGreaterThan(0);
  });

  it("rises once the sample is large and accurate", () => {
    const early = calculateMastery({
      attempts: 3,
      correct: 3,
      averageLatencyMs: 160,
      recencyAccuracy: 1,
    });
    const later = calculateMastery({
      attempts: 40,
      correct: 40,
      averageLatencyMs: 160,
      recencyAccuracy: 1,
    });
    expect(later).toBeGreaterThan(early);
    expect(later).toBeGreaterThan(50);
  });

  it("does not treat a missing first latency as slow", () => {
    const missing = calculateMastery({
      attempts: 8,
      correct: 8,
      averageLatencyMs: null,
      recencyAccuracy: 1,
    });
    const slow = calculateMastery({
      attempts: 8,
      correct: 8,
      averageLatencyMs: 800,
      recencyAccuracy: 1,
    });
    expect(missing).toBeGreaterThan(slow);
  });
});
