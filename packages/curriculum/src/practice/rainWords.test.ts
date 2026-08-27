import { describe, expect, it } from "vitest";
import { collectDisallowedGraphemes } from "../allowedKeys";
import { HOME_ROW_KEYS } from "../types";
import { pickRainWords } from "./rainWords";

describe("pickRainWords", () => {
  it("stays on allowed keys for a beginner F/J set", () => {
    const words = pickRainWords(["f", "j"]);
    expect(words.length).toBeGreaterThan(0);
    for (const word of words) {
      expect(collectDisallowedGraphemes(word, ["f", "j"])).toEqual([]);
      expect(word.split("").every((ch) => ch === "f" || ch === "j")).toBe(true);
    }
  });

  it("uses real words once the home row is unlocked", () => {
    const words = pickRainWords([...HOME_ROW_KEYS]);
    expect(words).toEqual(expect.arrayContaining(["flag", "glad", "ask"]));
    expect(words.some((word) => word.includes("e"))).toBe(false);
    for (const word of words) {
      expect(collectDisallowedGraphemes(word, [...HOME_ROW_KEYS])).toEqual([]);
    }
  });
});
