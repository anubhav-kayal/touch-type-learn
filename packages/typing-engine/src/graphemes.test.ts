import { describe, expect, it } from "vitest";
import { firstGrapheme, segmentGraphemes } from "./graphemes";

describe("segmentGraphemes", () => {
  it("splits ascii one character at a time", () => {
    expect(segmentGraphemes("asdf")).toEqual(["a", "s", "d", "f"]);
  });

  it("treats the rupee sign as one grapheme", () => {
    expect(segmentGraphemes("₹50")).toEqual(["₹", "5", "0"]);
    expect(firstGrapheme("₹")).toBe("₹");
  });

  it("normalizes combining marks so café matches", () => {
    const decomposed = "cafe\u0301";
    const composed = "café";
    expect(segmentGraphemes(decomposed)).toEqual(segmentGraphemes(composed));
  });
});
