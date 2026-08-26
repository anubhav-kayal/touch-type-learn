import { describe, expect, it } from "vitest";
import {
  HOME_ROW_BUMP_KEYS,
  US_QWERTY_ROWS,
  getFingerAssignment,
  getFingerForKey,
  getHomeRowFingers,
} from "./fingerMapping";

describe("fingerMapping", () => {
  it("maps the home row to the correct fingers", () => {
    expect(getHomeRowFingers()).toEqual({
      a: "left_pinky",
      s: "left_ring",
      d: "left_middle",
      f: "left_index",
      j: "right_index",
      k: "right_middle",
      l: "right_ring",
      ";": "right_pinky",
    });

    for (const [key, finger] of Object.entries(getHomeRowFingers())) {
      expect(getFingerForKey(key)).toBe(finger);
    }
  });

  it("maps space to the thumb", () => {
    expect(getFingerForKey(" ")).toBe("thumb");
  });

  it("keeps F and J on the home-row bump keys", () => {
    expect(HOME_ROW_BUMP_KEYS).toEqual(["f", "j"]);
    expect(US_QWERTY_ROWS.home).toContain("f");
    expect(US_QWERTY_ROWS.home).toContain("j");
  });

  it("uses the opposite-hand pinky for Shift", () => {
    expect(getFingerAssignment("A")).toMatchObject({
      baseKey: "a",
      keyFinger: "left_pinky",
      shiftFinger: "right_pinky",
      needsShift: true,
    });
    expect(getFingerAssignment("P")).toMatchObject({
      baseKey: "p",
      keyFinger: "right_pinky",
      shiftFinger: "left_pinky",
      needsShift: true,
    });
  });

  it("returns null for characters not on US QWERTY", () => {
    expect(getFingerForKey("₹")).toBeNull();
    expect(getFingerAssignment("₹").keyFinger).toBeNull();
  });
});
