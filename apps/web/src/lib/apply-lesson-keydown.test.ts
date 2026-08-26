import { createTypingSession } from "@keypath/typing-engine";
import { applyLessonKeydown } from "./apply-lesson-keydown";
import { describe, expect, it } from "vitest";

describe("applyLessonKeydown", () => {
  it("sends a character into the engine", () => {
    const session = createTypingSession({ expected: "ab" });
    const action = applyLessonKeydown(session, {
      key: "a",
      metaKey: false,
      ctrlKey: false,
      altKey: false,
    });
    expect(action).toBe("char");
    expect(session.getSnapshot().cursor).toBe(1);
  });

  it("handles backspace", () => {
    const session = createTypingSession({ expected: "ab" });
    applyLessonKeydown(session, {
      key: "x",
      metaKey: false,
      ctrlKey: false,
      altKey: false,
    });
    applyLessonKeydown(session, {
      key: "Backspace",
      metaKey: false,
      ctrlKey: false,
      altKey: false,
    });
    expect(session.getSnapshot().hasPendingError).toBe(false);
  });

  it("ignores shortcuts", () => {
    const session = createTypingSession({ expected: "ab" });
    const action = applyLessonKeydown(session, {
      key: "a",
      metaKey: true,
      ctrlKey: false,
      altKey: false,
    });
    expect(action).toBe("ignored");
    expect(session.getSnapshot().cursor).toBe(0);
  });
});
