import { describe, expect, it } from "vitest";
import { levelFromXp, xpProgressInLevel, xpRequiredToReach } from "./calculateLevel";

describe("user level", () => {
  it("starts at level 1 with no XP", () => {
    expect(xpRequiredToReach(1)).toBe(0);
    expect(levelFromXp(0)).toBe(1);
  });

  it("uses floor(80 * n^1.35) to reach the next level", () => {
    expect(xpRequiredToReach(2)).toBe(Math.floor(80 * 2 ** 1.35));
    expect(levelFromXp(xpRequiredToReach(2) - 1)).toBe(1);
    expect(levelFromXp(xpRequiredToReach(2))).toBe(2);
  });

  it("tracks leftover XP inside the current level", () => {
    const cost = xpRequiredToReach(2);
    expect(xpProgressInLevel(cost + 10)).toEqual({
      level: 2,
      into: 10,
      needed: xpRequiredToReach(3),
    });
  });
});
