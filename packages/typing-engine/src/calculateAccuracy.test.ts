import { describe, expect, it } from "vitest";
import { calculateAccuracy } from "./calculateAccuracy";

describe("calculateAccuracy", () => {
  it("is 1 when there are no keystrokes", () => {
    expect(calculateAccuracy(0, 0)).toBe(1);
  });

  it("counts errors even when later corrected", () => {
    expect(calculateAccuracy(10, 2)).toBeCloseTo(10 / 12);
  });

  it("is 1 for a perfect run", () => {
    expect(calculateAccuracy(20, 0)).toBe(1);
  });
});
