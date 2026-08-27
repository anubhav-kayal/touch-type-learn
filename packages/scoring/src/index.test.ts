import { describe, expect, it } from "vitest";
import { PACKAGE_NAME, MIN_KEY_ATTEMPTS, STAR_ACCURACY, XP, xpRequiredToReach } from "./index";

describe("@keypath/scoring", () => {
  it("exports the package name", () => {
    expect(PACKAGE_NAME).toBe("@keypath/scoring");
  });

  it("keeps one-star accuracy at 90%", () => {
    expect(STAR_ACCURACY.one).toBe(0.9);
  });

  it("exports the XP table and level curve", () => {
    expect(XP.accuracyPerfect).toBe(50);
    expect(XP.accuracyHigh).toBe(20);
    expect(xpRequiredToReach(2)).toBe(Math.floor(80 * 2 ** 1.35));
  });

  it("requires 10 attempts before a key can be weak", () => {
    expect(MIN_KEY_ATTEMPTS).toBe(10);
  });
});
