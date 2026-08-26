import { assertAllowedKeys } from "./allowedKeys";
import type { TypingExercise } from "./types";

export function tokens(parts: string[]): string {
  return parts.join(" ");
}

export function repeats(key: string, count: number): string {
  return Array.from({ length: count }, () => key).join(" ");
}

export function alternate(left: string, right: string, pairs: number): string {
  return Array.from({ length: pairs }, () => `${left} ${right}`).join(" ");
}

export function typing(
  type: TypingExercise["type"],
  prompt: string,
  allowedKeys: readonly string[],
): TypingExercise {
  assertAllowedKeys(prompt, allowedKeys);
  return { type, prompt };
}
