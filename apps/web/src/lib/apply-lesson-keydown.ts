import type { TypingSession } from "@keypath/typing-engine";

export type LessonKeyAction = "char" | "backspace" | "ignored";

interface LessonKeyEvent {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  isComposing?: boolean;
}

export function applyLessonKeydown(
  session: TypingSession,
  event: LessonKeyEvent,
): LessonKeyAction {
  if (event.isComposing || event.metaKey || event.ctrlKey || event.altKey) {
    return "ignored";
  }

  if (event.key === "Backspace") {
    session.handleBackspace();
    return "backspace";
  }

  if (event.key === "Tab" || event.key === "Enter" || event.key === "Escape") {
    return "ignored";
  }

  if (event.key.length === 1) {
    session.handleKey(event.key);
    return "char";
  }

  return "ignored";
}

export function shouldPreventDefault(action: LessonKeyAction, key: string): boolean {
  return action !== "ignored" || key === "Tab" || key === " ";
}
