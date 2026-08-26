import { describe, expect, it } from "vitest";
import { resolveKeyState } from "./resolveKeyState";

const home = {
  targetBaseKey: "f",
  targetFinger: "left_index" as const,
  shiftFinger: null,
  needsShift: false,
  pressedBaseKey: null,
  hasPendingError: false,
};

describe("resolveKeyState", () => {
  it("marks the target key", () => {
    expect(resolveKeyState({ ...home, keyId: "f" })).toBe("target");
  });

  it("marks other keys on the same finger", () => {
    expect(resolveKeyState({ ...home, keyId: "r" })).toBe("finger");
    expect(resolveKeyState({ ...home, keyId: "a" })).toBe("default");
  });

  it("marks the target as incorrect when an error is pending", () => {
    expect(resolveKeyState({ ...home, keyId: "f", hasPendingError: true })).toBe(
      "incorrect",
    );
  });

  it("marks a pressed key above target", () => {
    expect(resolveKeyState({ ...home, keyId: "f", pressedBaseKey: "f" })).toBe("pressed");
  });

  it("highlights the opposite-hand shift key", () => {
    expect(
      resolveKeyState({
        keyId: "shift-right",
        targetBaseKey: "a",
        targetFinger: "left_pinky",
        shiftFinger: "right_pinky",
        needsShift: true,
        pressedBaseKey: null,
        hasPendingError: false,
      }),
    ).toBe("shift");
  });
});
