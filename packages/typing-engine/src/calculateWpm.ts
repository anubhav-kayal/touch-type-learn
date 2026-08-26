import { MS_PER_MINUTE, WORD_CHAR_COUNT } from "./types";

export function calculateWpm(
  correctChars: number,
  allTypedChars: number,
  durationMs: number,
): { wpm: number; rawWpm: number } {
  if (durationMs <= 0) {
    return { wpm: 0, rawWpm: 0 };
  }
  const minutes = durationMs / MS_PER_MINUTE;
  return {
    wpm: correctChars / WORD_CHAR_COUNT / minutes,
    rawWpm: allTypedChars / WORD_CHAR_COUNT / minutes,
  };
}
