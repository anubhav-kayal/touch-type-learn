import { describe, expect, it } from "vitest";
import { calculateStars } from "./calculateStars";

describe("calculateStars", () => {
  it("gives 0 stars below 90% accuracy", () => {
    expect(calculateStars(0.899, 80)).toBe(0);
  });

  it("gives 1 star at 90%", () => {
    expect(calculateStars(0.9, 80)).toBe(1);
  });

  it("gives 2 stars at 95%", () => {
    expect(calculateStars(0.95, 80)).toBe(2);
  });

  it("gives 3 stars at 98% with consistency", () => {
    expect(calculateStars(0.98, 70)).toBe(3);
  });

  it("gives 3 stars on short drills with 99% and no consistency", () => {
    expect(calculateStars(0.99, null)).toBe(3);
  });

  it("does not require WPM unless a target is set", () => {
    expect(calculateStars(0.99, 80, { wpm: 5 })).toBe(3);
    expect(calculateStars(0.99, 80, { wpm: 5, targetWpm: 40 })).toBe(2);
  });
});
