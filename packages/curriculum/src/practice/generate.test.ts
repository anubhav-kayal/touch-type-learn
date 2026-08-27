import { describe, expect, it } from "vitest";
import { collectDisallowedGraphemes } from "../allowedKeys";
import {
  generateAccuracyDrill,
  generateCommonWordsDrill,
  generateNumbersDrill,
  generatePracticePrompt,
  generatePunctuationDrill,
  generateSpeedDrill,
  generateWeakKeyDrill,
  wordsFittingKeys,
} from "./generate";
import { NUMBER_KEYS, PUNCTUATION_KEYS, listPracticeModes } from "./modes";
import { COMMON_PRACTICE_WORDS } from "./words";
import { getWorlds } from "../catalog";
import { listPlayableLessons } from "../progress";
import { practiceAllowedKeys } from "../unlockedKeys";

function rngFrom(values: number[]): () => number {
  let index = 0;
  return () => {
    const value = values[index % values.length] ?? 0.1;
    index += 1;
    return value;
  };
}

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

describe("unlocked practice generators", () => {
  const home = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"];
  const rng = rngFrom([0.1, 0.4, 0.7, 0.2, 0.9]);

  it("keeps accuracy and speed drills inside allowedKeys", () => {
    const accuracy = generateAccuracyDrill({ allowedKeys: home, rng });
    const speed = generateSpeedDrill({ allowedKeys: home, rng });
    expect(accuracy.length).toBeGreaterThan(0);
    expect(speed.length).toBeGreaterThan(accuracy.length);
    expect(collectDisallowedGraphemes(accuracy, home)).toEqual([]);
    expect(collectDisallowedGraphemes(speed, home)).toEqual([]);
  });

  it("filters common words to unlocked letters", () => {
    const prompt = generateCommonWordsDrill({ allowedKeys: home, rng });
    expect(prompt.length).toBeGreaterThan(0);
    expect(collectDisallowedGraphemes(prompt, home)).toEqual([]);
    expect(wordsFittingKeys(COMMON_PRACTICE_WORDS, ["f", "j"]).filter((word) => word.length >= 2)).toEqual(
      [],
    );
    expect(generateCommonWordsDrill({ allowedKeys: ["f", "j"], rng })).toBe("");
  });
});

describe("mode key-set generators", () => {
  it("emits punctuation from the punctuation key set", () => {
    const prompt = generatePunctuationDrill({ rng: rngFrom([0.2, 0.8]) });
    expect(/[.,'!?]/.test(prompt)).toBe(true);
    expect(collectDisallowedGraphemes(prompt, [...PUNCTUATION_KEYS])).toEqual([]);
  });

  it("emits only digits and spaces for numbers", () => {
    const prompt = generateNumbersDrill({ rng: rngFrom([0.1, 0.6]) });
    expect(/[0-9]/.test(prompt)).toBe(true);
    expect(collectDisallowedGraphemes(prompt, [...NUMBER_KEYS])).toEqual([]);
  });
});

describe("practice catalog", () => {
  it("lists at least four modes besides Learn", () => {
    expect(listPracticeModes().length).toBeGreaterThanOrEqual(4);
    expect(generatePracticePrompt({ modeId: "numbers", allowedKeys: [] }).length).toBeGreaterThan(0);
  });
});
