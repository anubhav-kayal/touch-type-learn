import { describe, expect, it } from "vitest";
import {
  CUSTOM_TEXT_MAX_CHARS,
  CUSTOM_TEXT_MAX_RAW,
  prepareCustomPracticeText,
} from "./customText";

describe("prepareCustomPracticeText", () => {
  it("keeps a US QWERTY sentence that can still be scored", () => {
    const result = prepareCustomPracticeText("Hello, world.");
    expect(result).toEqual({ ok: true, prompt: "Hello, world.", dropped: [] });
  });

  it("normalizes quotes and dashes, then drops leftover unicode", () => {
    const result = prepareCustomPracticeText("It’s a “good” day — yes. 👋");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.prompt).toBe("It's a \"good\" day - yes.");
      expect(result.dropped).toContain("👋");
    }
  });

  it("rejects enormous pastes", () => {
    expect(prepareCustomPracticeText("a".repeat(CUSTOM_TEXT_MAX_RAW + 1))).toEqual({
      ok: false,
      error: "too-long",
      dropped: [],
    });
    expect(prepareCustomPracticeText("a".repeat(CUSTOM_TEXT_MAX_CHARS + 1)).ok).toBe(false);
  });

  it("rejects empty or non-typeable input", () => {
    expect(prepareCustomPracticeText("   ")).toMatchObject({ ok: false, error: "empty" });
    expect(prepareCustomPracticeText("你好")).toMatchObject({ ok: false, error: "no-typeable" });
  });
});
