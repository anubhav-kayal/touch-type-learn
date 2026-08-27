import { collectDisallowedGraphemes } from "../allowedKeys";
import { wordsFittingKeys } from "./generate";
import { COMMON_PRACTICE_WORDS } from "./words";

const MIN_LIST = 6;

function letterKeys(allowedKeys: readonly string[]): string[] {
  return allowedKeys.filter((key) => key.length === 1 && key !== " " && key !== ";");
}

function generatedTokens(letters: readonly string[]): string[] {
  const tokens: string[] = [];
  for (const first of letters) {
    tokens.push(first);
    for (const second of letters) {
      tokens.push(`${first}${second}`);
      for (const third of letters) {
        tokens.push(`${first}${second}${third}`);
        if (tokens.length >= 48) {
          return [...new Set(tokens)];
        }
      }
    }
  }
  return [...new Set(tokens)];
}

/** Words (or short tokens) that stay inside unlocked keys for Word Rain. */
export function pickRainWords(allowedKeys: readonly string[]): string[] {
  const letters = letterKeys(allowedKeys);
  const fromList = wordsFittingKeys(COMMON_PRACTICE_WORDS, allowedKeys).filter(
    (word) => word.length >= 2 && word.length <= 8 && !word.includes("'"),
  );
  const pool = fromList.length >= MIN_LIST ? fromList : [...fromList, ...generatedTokens(letters)];
  return pool.filter((word) => collectDisallowedGraphemes(word, allowedKeys).length === 0);
}
