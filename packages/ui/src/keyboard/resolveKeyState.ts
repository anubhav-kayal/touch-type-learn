import type { Finger } from "@keypath/typing-engine";
import { getFingerForKey, getModifierFinger } from "@keypath/typing-engine";

export type VirtualKeyState =
  | "default"
  | "target"
  | "pressed"
  | "finger"
  | "incorrect"
  | "shift";

export type VirtualKeyId = string;

export interface ResolveKeyStateInput {
  keyId: VirtualKeyId;
  targetBaseKey: string | null;
  targetFinger: Finger | null;
  shiftFinger: Finger | null;
  needsShift: boolean;
  pressedBaseKey: string | null;
  hasPendingError: boolean;
}

function fingerForKeyId(keyId: VirtualKeyId): Finger | null {
  if (keyId === "shift-left" || keyId === "shift-right" || keyId === "space") {
    return getModifierFinger(keyId);
  }
  return getFingerForKey(keyId);
}

function isHighlightedShift(keyId: VirtualKeyId, input: ResolveKeyStateInput): boolean {
  if (!input.needsShift || !input.shiftFinger) {
    return false;
  }
  if (keyId === "shift-left") {
    return input.shiftFinger === "left_pinky";
  }
  if (keyId === "shift-right") {
    return input.shiftFinger === "right_pinky";
  }
  return false;
}

export function resolveKeyState(input: ResolveKeyStateInput): VirtualKeyState {
  if (input.pressedBaseKey !== null && input.keyId === input.pressedBaseKey) {
    return "pressed";
  }

  if (isHighlightedShift(input.keyId, input)) {
    return "shift";
  }

  if (input.targetBaseKey !== null && input.keyId === input.targetBaseKey) {
    return input.hasPendingError ? "incorrect" : "target";
  }

  const keyFinger = fingerForKeyId(input.keyId);
  if (
    input.targetFinger &&
    keyFinger === input.targetFinger &&
    input.keyId !== input.targetBaseKey
  ) {
    return "finger";
  }

  return "default";
}
