import type { AssistanceLevel } from "../types";
import type { InputMode } from "@keypath/typing-engine";

export const PRACTICE_MODE_IDS = [
  "weak-keys",
  "accuracy",
  "speed",
  "common-words",
  "punctuation",
  "numbers",
  "custom",
] as const;

export type PracticeModeId = (typeof PRACTICE_MODE_IDS)[number];

export type PracticeKeySource = "unlocked" | "punctuation" | "numbers" | "custom";

export interface PracticeMode {
  id: PracticeModeId;
  title: string;
  blurb: string;
  inputMode: InputMode;
  assistance: AssistanceLevel;
  keySource: PracticeKeySource;
}

export const PUNCTUATION_KEYS = [
  ..."abcdefghijklmnopqrstuvwxyz".split(""),
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  ".",
  ",",
  "'",
  "?",
  "!",
] as const;

export const NUMBER_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

export const PRACTICE_MODES: readonly PracticeMode[] = [
  {
    id: "weak-keys",
    title: "Weak keys",
    blurb: "The letters that still snag, inside keys you have already unlocked.",
    inputMode: "forced-correction",
    assistance: "on-error",
    keySource: "unlocked",
  },
  {
    id: "accuracy",
    title: "Accuracy",
    blurb: "Forced correction. Clean hits. No rushing the home row.",
    inputMode: "forced-correction",
    assistance: "on-error",
    keySource: "unlocked",
  },
  {
    id: "speed",
    title: "Speed",
    blurb: "Free-flow. Keep the line moving; misses still count.",
    inputMode: "free-flow",
    assistance: "hidden",
    keySource: "unlocked",
  },
  {
    id: "common-words",
    title: "Common words",
    blurb: "High-frequency English, filtered to letters you have learned.",
    inputMode: "forced-correction",
    assistance: "on-error",
    keySource: "unlocked",
  },
  {
    id: "punctuation",
    title: "Punctuation",
    blurb: "Comma, period, apostrophe, question, and a little Shift.",
    inputMode: "forced-correction",
    assistance: "on-error",
    keySource: "punctuation",
  },
  {
    id: "numbers",
    title: "Numbers",
    blurb: "The number row. Eyes up; thumbs on the space bar.",
    inputMode: "forced-correction",
    assistance: "on-error",
    keySource: "numbers",
  },
  {
    id: "custom",
    title: "Custom text",
    blurb: "Paste a short paragraph. We keep US QWERTY and cap the length.",
    inputMode: "forced-correction",
    assistance: "hidden",
    keySource: "custom",
  },
];

export function listPracticeModes(): readonly PracticeMode[] {
  return PRACTICE_MODES;
}

export function getPracticeMode(id: string): PracticeMode | undefined {
  return PRACTICE_MODES.find((mode) => mode.id === id);
}

export function isPracticeModeId(id: string): id is PracticeModeId {
  return (PRACTICE_MODE_IDS as readonly string[]).includes(id);
}
