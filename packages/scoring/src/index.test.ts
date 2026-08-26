import { describe, expect, it } from "vitest";
import { PACKAGE_NAME, STAR_ACCURACY } from "./index";

describe("@keypath/scoring", () => {
  it("exports the package name", () => {
    expect(PACKAGE_NAME).toBe("@keypath/scoring");
  });

  it("keeps one-star accuracy at 90%", () => {
    expect(STAR_ACCURACY.one).toBe(0.9);
  });
});
