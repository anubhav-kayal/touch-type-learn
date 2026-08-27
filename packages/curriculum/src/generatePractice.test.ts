import { describe, expect, it } from "vitest";
import { collectDisallowedGraphemes } from "./allowedKeys";
import { generateWeakKeyDrill } from "./generatePractice";
import { getWorlds } from "./catalog";
import { listPlayableLessons } from "./progress";
import { practiceAllowedKeys } from "./unlockedKeys";

describe("practiceAllowedKeys", () => {
  const playable = listPlayableLessons(getWorlds());

  it("stays on F and J until later home-row lessons unlock", () => {
    expect(practiceAllowedKeys(playable, {})).toEqual(["f", "j"]);
    expect(practiceAllowedKeys(playable, { "w1-orient": 1, "w1-home-fj": 1 })).toEqual(
      expect.arrayContaining(["f", "j", "d", "k"]),
    );
    expect(practiceAllowedKeys(playable, { "w1-orient": 1, "w1-home-fj": 1 })).not.toContain(
      "e",
    );
  });
});

describe("generateWeakKeyDrill", () => {
  it("never emits letters outside allowedKeys", () => {
    const rng = () => 0.1;
    const prompt = generateWeakKeyDrill({
      focusKeys: ["f", "j"],
      exploreKeys: ["d"],
      allowedKeys: ["f", "j"],
      rng,
    });
    expect(prompt.length).toBeGreaterThan(0);
    expect(collectDisallowedGraphemes(prompt, ["f", "j"])).toEqual([]);
    expect(prompt.includes("d")).toBe(false);
  });

  it("returns empty when there are no usable focus keys", () => {
    expect(
      generateWeakKeyDrill({
        focusKeys: ["e"],
        allowedKeys: ["f", "j"],
      }),
    ).toBe("");
  });
});
