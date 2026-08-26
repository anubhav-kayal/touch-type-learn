import { describe, expect, it } from "vitest";
import { createTypingSession } from "./engine";
import { createManualClock } from "./timing";

function typeText(
  session: ReturnType<typeof createTypingSession>,
  text: string,
  clock: ReturnType<typeof createManualClock>,
  intervalMs = 50,
) {
  for (const [index, character] of Array.from(text).entries()) {
    if (index > 0) {
      clock.advance(intervalMs);
    }
    session.handleKey(character);
  }
}

describe("TypingSession", () => {
  it("advances on correct characters in forced-correction mode", () => {
    const session = createTypingSession({ expected: "hi", now: () => 0 });
    session.handleKey("h");
    const afterFirst = session.getSnapshot();
    expect(afterFirst.cursor).toBe(1);
    expect(afterFirst.statuses).toEqual(["correct", "pending"]);
    expect(afterFirst.currentExpected).toBe("i");

    session.handleKey("i");
    const done = session.getSnapshot();
    expect(done.isComplete).toBe(true);
    expect(done.statuses).toEqual(["correct", "correct"]);
    expect(done.accuracy).toBe(1);
    expect(done.combo).toBe(2);
    expect(done.maxCombo).toBe(2);
  });

  it("does not advance on a mistake in forced-correction mode", () => {
    const session = createTypingSession({ expected: "ab" });
    const snapshot = session.handleKey("x");
    expect(snapshot.cursor).toBe(0);
    expect(snapshot.hasPendingError).toBe(true);
    expect(snapshot.statuses[0]).toBe("incorrect");
    expect(snapshot.errorKeystrokes).toBe(1);
    expect(snapshot.combo).toBe(0);

    const stillStuck = session.handleKey("b");
    expect(stillStuck.cursor).toBe(0);
    expect(stillStuck.hasPendingError).toBe(true);
    expect(stillStuck.errorKeystrokes).toBe(2);
  });

  it("advances on a mistake in free-flow mode", () => {
    const session = createTypingSession({
      expected: "ab",
      inputMode: "free-flow",
    });
    const snapshot = session.handleKey("x");
    expect(snapshot.cursor).toBe(1);
    expect(snapshot.hasPendingError).toBe(false);
    expect(snapshot.statuses[0]).toBe("incorrect");
    expect(snapshot.currentExpected).toBe("b");
  });

  it("clears a pending error with backspace, then accepts the correct key", () => {
    const session = createTypingSession({ expected: "ab" });
    session.handleKey("x");
    const cleared = session.handleBackspace();
    expect(cleared.hasPendingError).toBe(false);
    expect(cleared.statuses[0]).toBe("pending");
    expect(cleared.cursor).toBe(0);

    const fixed = session.handleKey("a");
    expect(fixed.statuses[0]).toBe("correct");
    expect(fixed.cursor).toBe(1);
    expect(fixed.correctedErrors).toBe(1);
    expect(fixed.errorKeystrokes).toBe(1);
    expect(fixed.accuracy).toBe(0.5);
  });

  it("supports double backspace", () => {
    const session = createTypingSession({ expected: "abc" });
    session.handleKey("a");
    session.handleKey("b");
    session.handleBackspace();
    const once = session.getSnapshot();
    expect(once.cursor).toBe(1);
    expect(once.statuses).toEqual(["correct", "pending", "pending"]);

    session.handleBackspace();
    const twice = session.getSnapshot();
    expect(twice.cursor).toBe(0);
    expect(twice.statuses).toEqual(["pending", "pending", "pending"]);

    session.handleBackspace();
    expect(session.getSnapshot().cursor).toBe(0);
  });

  it("completes when the last character is correct", () => {
    const session = createTypingSession({ expected: "ok" });
    session.handleKey("o");
    expect(session.getSnapshot().isComplete).toBe(false);
    session.handleKey("k");
    expect(session.getSnapshot().isComplete).toBe(true);
    expect(session.getSnapshot().currentExpected).toBeNull();
  });

  it("treats an empty prompt as already complete", () => {
    const session = createTypingSession({ expected: "" });
    const snapshot = session.getSnapshot();
    expect(snapshot.isComplete).toBe(true);
    expect(snapshot.expected).toEqual([]);
    expect(snapshot.wpm).toBe(0);
    expect(snapshot.accuracy).toBe(1);
    session.handleKey("a");
    expect(session.getSnapshot().errorKeystrokes).toBe(0);
  });

  it("handles rapid typing with a fake clock", () => {
    const clock = createManualClock();
    const session = createTypingSession({ expected: "hello", now: clock.now });
    typeText(session, "hello", clock, 10);
    const snapshot = session.getSnapshot();
    expect(snapshot.isComplete).toBe(true);
    expect(snapshot.durationMs).toBe(40);
    expect(snapshot.wpm).toBeCloseTo(5 / 5 / (40 / 60_000));
    expect(snapshot.rawWpm).toBe(snapshot.wpm);
  });

  it("types the rupee sign as a single character", () => {
    const session = createTypingSession({ expected: "₹1" });
    const first = session.handleKey("₹");
    expect(first.cursor).toBe(1);
    expect(first.statuses[0]).toBe("correct");
    expect(first.currentExpected).toBe("1");
    session.handleKey("1");
    expect(session.getSnapshot().isComplete).toBe(true);
  });

  it("records per-key substitutions", () => {
    const session = createTypingSession({
      expected: "p",
      inputMode: "free-flow",
    });
    session.handleKey("o");
    const stats = session.getSnapshot().keyStats.p;
    expect(stats).toMatchObject({ attempts: 1, correct: 0, errors: 1 });
    expect(stats?.substitutions).toEqual({ o: 1 });
  });

  it("freezes duration after completion", () => {
    const clock = createManualClock();
    const session = createTypingSession({ expected: "ab", now: clock.now });
    session.handleKey("a");
    clock.advance(100);
    session.handleKey("b");
    clock.advance(5_000);
    expect(session.getSnapshot().durationMs).toBe(100);
    expect(session.handleKey("x").errorKeystrokes).toBe(0);
  });

  it("exposes the current target finger", () => {
    const session = createTypingSession({ expected: "f" });
    expect(session.getSnapshot().currentFinger?.keyFinger).toBe("left_index");
  });

  it("resets combo on a mistake and keeps maxCombo", () => {
    const session = createTypingSession({ expected: "aaa" });
    session.handleKey("a");
    session.handleKey("a");
    session.handleKey("x");
    const snapshot = session.getSnapshot();
    expect(snapshot.combo).toBe(0);
    expect(snapshot.maxCombo).toBe(2);
  });
});

describe("consistency through the engine", () => {
  it("scores even typing higher than burst-pause-burst typing", () => {
    const evenClock = createManualClock();
    const even = createTypingSession({
      expected: "asdf jkl;",
      now: evenClock.now,
    });
    typeText(even, "asdf jkl;", evenClock, 200);

    const burstClock = createManualClock();
    const burst = createTypingSession({
      expected: "asdf jkl;",
      now: burstClock.now,
    });
    const burstIntervals = [50, 50, 50, 50, 400, 50, 50, 400];
    for (const [index, character] of Array.from("asdf jkl;").entries()) {
      if (index > 0) {
        burstClock.advance(burstIntervals[index - 1] ?? 50);
      }
      burst.handleKey(character);
    }

    const evenScore = even.getSnapshot().consistency;
    const burstScore = burst.getSnapshot().consistency;
    expect(evenScore).toBe(100);
    expect(burstScore).not.toBeNull();
    expect(burstScore as number).toBeLessThan(100);
  });

  it("does not let a long pause lower consistency", () => {
    const clock = createManualClock();
    const session = createTypingSession({
      expected: "asdf jkl;a",
      now: clock.now,
    });
    const text = "asdf jkl;a";
    for (const [index, character] of Array.from(text).entries()) {
      if (index > 0) {
        clock.advance(index === 4 ? 2000 : 200);
      }
      session.handleKey(character);
    }
    expect(session.getSnapshot().consistency).toBe(100);
  });
});
