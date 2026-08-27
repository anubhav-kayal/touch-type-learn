import { createManualClock } from "@keypath/typing-engine";
import { describe, expect, it } from "vitest";
import { WordRainController, wordY } from "./controller";

describe("WordRainController", () => {
  it("commits a word on an exact match", () => {
    const clock = createManualClock(0);
    const game = new WordRainController({
      pool: ["flag"],
      now: clock.now,
      rng: () => 0.5,
    });
    game.start();
    game.tick(0);
    const typed = game.hud().words[0];
    expect(typed?.text).toBe("flag");

    expect(game.handleKey("f").kind).toBe("locked");
    clock.advance(120);
    expect(game.handleKey("l").kind).toBe("progress");
    clock.advance(120);
    expect(game.handleKey("a").kind).toBe("progress");
    clock.advance(120);
    const caught = game.handleKey("g");
    expect(caught).toEqual({ kind: "caught", wordId: typed!.id, text: "flag" });
    expect(game.hud().caught).toBe(1);
    expect(game.hud().words).toHaveLength(0);
    expect(game.results().accuracy).toBe(1);
    expect(game.results().wpm).toBeGreaterThan(0);
  });

  it("misses a word that reaches the desk", () => {
    const clock = createManualClock(0);
    const game = new WordRainController({
      pool: ["ask"],
      now: clock.now,
      rng: () => 0,
    });
    game.start();
    const word = game.hud().words[0];
    expect(word).toBeDefined();
    clock.set(word!.fallMs);
    expect(wordY(word!, clock.now())).toBeGreaterThanOrEqual(1);
    const { missed } = game.tick();
    expect(missed.map((item) => item.id)).toEqual([word!.id]);
    expect(game.hud().missed).toBe(1);
    expect(game.hud().lives).toBe(2);
    expect(game.hud().words.some((item) => item.id === word!.id)).toBe(false);
  });

  it("ends after three misses", () => {
    const clock = createManualClock(0);
    const game = new WordRainController({
      pool: ["a"],
      now: clock.now,
      rng: () => 0,
    });
    game.start();
    for (let i = 0; i < 3; i += 1) {
      const falling = game.hud().words[0];
      if (falling) {
        clock.set(falling.bornAt + falling.fallMs);
        game.tick();
      }
    }
    expect(game.hud().status).toBe("over");
    expect(game.hud().lives).toBe(0);
  });
});
