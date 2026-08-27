import { assertAllowedKeys } from "../allowedKeys";
import { segmentGraphemes } from "@keypath/typing-engine";
import { NUMBER_KEYS, PUNCTUATION_KEYS, type PracticeModeId } from "./modes";
import { COMMON_PRACTICE_WORDS } from "./words";

function defaultRng(): number {
  return Math.random();
}

function pickIndex(length: number, rng: () => number): number {
  if (length <= 0) {
    return 0;
  }
  return Math.min(length - 1, Math.floor(rng() * length));
}

function letterKeys(allowedKeys: readonly string[]): string[] {
  return allowedKeys.filter((key) => key.length > 0 && key !== " ");
}

export function wordsFittingKeys(
  words: readonly string[],
  allowedKeys: readonly string[],
): string[] {
  const allowed = new Set(allowedKeys);
  return words.filter((word) =>
    segmentGraphemes(word).every((grapheme) => allowed.has(grapheme)),
  );
}

function fillWithWords(
  words: readonly string[],
  minChars: number,
  rng: () => number,
): string {
  if (words.length === 0) {
    return "";
  }
  const parts: string[] = [];
  let length = 0;
  let guard = 0;
  while (length < minChars && guard < 48) {
    const word = words[pickIndex(words.length, rng)] ?? words[0]!;
    parts.push(word);
    length += word.length + (parts.length > 1 ? 1 : 0);
    guard += 1;
  }
  return parts.join(" ");
}

export function generateWeakKeyDrill(input: {
  focusKeys: readonly string[];
  exploreKeys?: readonly string[];
  allowedKeys: readonly string[];
  rng?: () => number;
}): string {
  const allowed = new Set(input.allowedKeys);
  const focus = input.focusKeys.filter((key) => key.length > 0 && allowed.has(key));
  const explore = (input.exploreKeys ?? []).filter(
    (key) => key.length > 0 && allowed.has(key) && !focus.includes(key),
  );
  if (focus.length === 0) {
    return "";
  }

  const rng = input.rng ?? defaultRng;
  const pool = [...focus, ...explore];

  function sample(): string {
    if (explore.length > 0 && rng() < 0.15) {
      return explore[pickIndex(explore.length, rng)] ?? focus[0]!;
    }
    const weights = focus.map((_, index) => focus.length - index);
    let ticket = rng() * weights.reduce((sum, weight) => sum + weight, 0);
    for (let i = 0; i < focus.length; i += 1) {
      ticket -= weights[i] ?? 0;
      if (ticket <= 0) {
        return focus[i] ?? focus[0]!;
      }
    }
    return focus[0]!;
  }

  const parts: string[] = [];
  for (const key of focus) {
    parts.push(`${key} ${key} ${key}`);
  }
  while (segmentGraphemes(parts.join(" ")).length < 42 && parts.length < 14) {
    const a = sample();
    const b = sample();
    const roll = rng();
    if (roll < 0.4) {
      parts.push(`${a} ${a} ${a} ${a}`);
    } else if (roll < 0.75) {
      parts.push(`${a} ${b} ${a} ${b}`);
    } else {
      const c = pool[pickIndex(pool.length, rng)] ?? a;
      parts.push(`${a}${b}${c}`);
    }
  }

  const prompt = parts.join(" ");
  assertAllowedKeys(prompt, input.allowedKeys);
  return prompt;
}

function unlockedFallback(allowedKeys: readonly string[], rng: () => number): string {
  const focus = letterKeys(allowedKeys);
  return generateWeakKeyDrill({ focusKeys: focus, allowedKeys, rng });
}

export function generateAccuracyDrill(input: {
  allowedKeys: readonly string[];
  rng?: () => number;
}): string {
  const rng = input.rng ?? defaultRng;
  const words = wordsFittingKeys(COMMON_PRACTICE_WORDS, input.allowedKeys);
  const prompt = words.length > 0 ? fillWithWords(words, 42, rng) : unlockedFallback(input.allowedKeys, rng);
  if (!prompt) {
    return "";
  }
  assertAllowedKeys(prompt, input.allowedKeys);
  return prompt;
}

export function generateSpeedDrill(input: {
  allowedKeys: readonly string[];
  rng?: () => number;
}): string {
  const rng = input.rng ?? defaultRng;
  const words = wordsFittingKeys(COMMON_PRACTICE_WORDS, input.allowedKeys);
  const prompt = words.length > 0 ? fillWithWords(words, 96, rng) : unlockedFallback(input.allowedKeys, rng);
  if (!prompt) {
    return "";
  }
  assertAllowedKeys(prompt, input.allowedKeys);
  return prompt;
}

export function generateCommonWordsDrill(input: {
  allowedKeys: readonly string[];
  rng?: () => number;
}): string {
  const rng = input.rng ?? defaultRng;
  const words = wordsFittingKeys(COMMON_PRACTICE_WORDS, input.allowedKeys).filter(
    (word) => word.length >= 2,
  );
  const prompt = fillWithWords(words, 56, rng);
  if (!prompt) {
    return "";
  }
  assertAllowedKeys(prompt, input.allowedKeys);
  return prompt;
}

const PUNCTUATION_PROMPTS = [
  "Wait, then go.",
  "Yes, I see it.",
  "Hello, how are you?",
  "It's a good day.",
  "Don't stop now.",
  "Stop, look, then type.",
  "Are you ready?",
  "Type this, then rest.",
  "She said hello.",
  "Keep going. Don't look down.",
];

export function generatePunctuationDrill(input: { rng?: () => number } = {}): string {
  const rng = input.rng ?? defaultRng;
  const first = PUNCTUATION_PROMPTS[pickIndex(PUNCTUATION_PROMPTS.length, rng)]!;
  const second = PUNCTUATION_PROMPTS[pickIndex(PUNCTUATION_PROMPTS.length, rng)]!;
  const prompt = first === second ? first : `${first} ${second}`;
  assertAllowedKeys(prompt, PUNCTUATION_KEYS);
  return prompt;
}

const NUMBER_CLUSTERS = [
  "1 2 3 4 5 6 7 8 9 0",
  "12 34 56 78 90",
  "100 200 300",
  "2026 10 30",
  "3 14 15 92",
  "555 1212",
  "11 22 33 44",
  "8 0 8 0 9",
];

export function generateNumbersDrill(input: { rng?: () => number } = {}): string {
  const rng = input.rng ?? defaultRng;
  const parts = [
    NUMBER_CLUSTERS[pickIndex(NUMBER_CLUSTERS.length, rng)]!,
    NUMBER_CLUSTERS[pickIndex(NUMBER_CLUSTERS.length, rng)]!,
  ];
  const prompt = parts.join(" ");
  assertAllowedKeys(prompt, NUMBER_KEYS);
  return prompt;
}

export function generatePracticePrompt(input: {
  modeId: PracticeModeId;
  allowedKeys: readonly string[];
  focusKeys?: readonly string[];
  exploreKeys?: readonly string[];
  rng?: () => number;
}): string {
  switch (input.modeId) {
    case "weak-keys":
      return generateWeakKeyDrill({
        focusKeys: input.focusKeys ?? letterKeys(input.allowedKeys),
        exploreKeys: input.exploreKeys,
        allowedKeys: input.allowedKeys,
        rng: input.rng,
      });
    case "accuracy":
      return generateAccuracyDrill({ allowedKeys: input.allowedKeys, rng: input.rng });
    case "speed":
      return generateSpeedDrill({ allowedKeys: input.allowedKeys, rng: input.rng });
    case "common-words":
      return generateCommonWordsDrill({ allowedKeys: input.allowedKeys, rng: input.rng });
    case "punctuation":
      return generatePunctuationDrill({ rng: input.rng });
    case "numbers":
      return generateNumbersDrill({ rng: input.rng });
    case "custom":
      return "";
  }
}
