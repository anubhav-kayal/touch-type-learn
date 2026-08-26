import { segmentGraphemes } from "@keypath/typing-engine";

const DEFAULT_EXTRAS = [" "];

export function collectDisallowedGraphemes(
  text: string,
  allowedKeys: readonly string[],
  extras: readonly string[] = DEFAULT_EXTRAS,
): string[] {
  const allowed = new Set([...allowedKeys, ...extras]);
  const disallowed: string[] = [];
  for (const grapheme of segmentGraphemes(text)) {
    if (!allowed.has(grapheme) && !disallowed.includes(grapheme)) {
      disallowed.push(grapheme);
    }
  }
  return disallowed;
}

export function assertAllowedKeys(
  text: string,
  allowedKeys: readonly string[],
  extras: readonly string[] = DEFAULT_EXTRAS,
): void {
  const disallowed = collectDisallowedGraphemes(text, allowedKeys, extras);
  if (disallowed.length > 0) {
    throw new Error(
      `Prompt contains keys outside allowedKeys: ${disallowed.join(" ")}`,
    );
  }
}

export function isTypingExercise(
  exercise: { type: string; prompt?: string },
): exercise is { type: string; prompt: string } {
  return exercise.type !== "introduction" && typeof exercise.prompt === "string";
}
