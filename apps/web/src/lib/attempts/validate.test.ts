import { validateAttemptPayload, validatePracticePayload } from "@/lib/attempts/validate";
import { describe, expect, it } from "vitest";

const valid = {
  lessonId: "w1-orient",
  durationMs: 4000,
  wpm: 12,
  rawWpm: 14,
  accuracy: 0.95,
  consistency: null,
  errors: 1,
  correctedErrors: 1,
  maxCombo: 8,
  keyStats: {
    f: { key: "f", attempts: 6, correct: 5, errors: 1, averageLatencyMs: 180 },
  },
};

describe("validateAttemptPayload", () => {
  it("accepts a catalog lesson and recomputes stars", () => {
    const result = validateAttemptPayload(valid);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.stars).toBe(2);
      expect(result.payload.lessonId).toBe("w1-orient");
    }
  });

  it("rejects unknown lessons", () => {
    const result = validateAttemptPayload({ ...valid, lessonId: "not-a-lesson" });
    expect(result.ok).toBe(false);
  });

  it("rejects inflated accuracy", () => {
    const result = validateAttemptPayload({ ...valid, accuracy: 1.2 });
    expect(result.ok).toBe(false);
  });
});

describe("validatePracticePayload", () => {
  it("accepts key stats without a lesson id", () => {
    const result = validatePracticePayload({
      durationMs: 8000,
      keyStats: valid.keyStats,
    });
    expect(result.ok).toBe(true);
  });
});
