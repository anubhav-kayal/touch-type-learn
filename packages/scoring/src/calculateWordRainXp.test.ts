import { describe, expect, it } from "vitest";
import { calculateWordRainXp } from "./calculateWordRainXp";

describe("calculateWordRainXp", () => {
  it("awards nothing when no word was caught", () => {
    expect(calculateWordRainXp({ caught: 0, missed: 3, accuracy: 1 })).toBe(0);
  });

  it("pays per catch and caps a long clean run", () => {
    expect(calculateWordRainXp({ caught: 2, missed: 1, accuracy: 0.9 })).toBe(8);
    expect(calculateWordRainXp({ caught: 10, missed: 0, accuracy: 1 })).toBe(105);
    expect(calculateWordRainXp({ caught: 80, missed: 0, accuracy: 1 })).toBe(120);
  });
});
