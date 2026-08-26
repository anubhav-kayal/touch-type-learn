import { describe, expect, it } from "vitest";
import { calculateWpm } from "./calculateWpm";

describe("calculateWpm", () => {
  it("returns zeros when duration is 0", () => {
    expect(calculateWpm(20, 20, 0)).toEqual({ wpm: 0, rawWpm: 0 });
  });

  it("treats five characters as one word", () => {
    const { wpm } = calculateWpm(5, 5, 60_000);
    expect(wpm).toBe(1);
  });

  it("computes raw WPM from all typed characters", () => {
    const { wpm, rawWpm } = calculateWpm(10, 15, 60_000);
    expect(wpm).toBe(2);
    expect(rawWpm).toBe(3);
  });
});
