import type { Finger, FingerAssignment } from "./types";

export const FINGERS = [
  "left_pinky",
  "left_ring",
  "left_middle",
  "left_index",
  "right_index",
  "right_middle",
  "right_ring",
  "right_pinky",
  "thumb",
] as const satisfies readonly Finger[];

const KEY_TO_FINGER: Record<string, Finger> = {
  "`": "left_pinky",
  "1": "left_pinky",
  q: "left_pinky",
  a: "left_pinky",
  z: "left_pinky",
  "2": "left_ring",
  w: "left_ring",
  s: "left_ring",
  x: "left_ring",
  "3": "left_middle",
  e: "left_middle",
  d: "left_middle",
  c: "left_middle",
  "4": "left_index",
  r: "left_index",
  f: "left_index",
  v: "left_index",
  "5": "left_index",
  t: "left_index",
  g: "left_index",
  b: "left_index",
  "6": "right_index",
  y: "right_index",
  h: "right_index",
  n: "right_index",
  "7": "right_index",
  u: "right_index",
  j: "right_index",
  m: "right_index",
  "8": "right_middle",
  i: "right_middle",
  k: "right_middle",
  ",": "right_middle",
  "9": "right_ring",
  o: "right_ring",
  l: "right_ring",
  ".": "right_ring",
  "0": "right_pinky",
  p: "right_pinky",
  ";": "right_pinky",
  "/": "right_pinky",
  "-": "right_pinky",
  "=": "right_pinky",
  "[": "right_pinky",
  "]": "right_pinky",
  "\\": "right_pinky",
  "'": "right_pinky",
  " ": "thumb",
};

const SHIFTED_TO_BASE: Record<string, string> = {
  "~": "`",
  "!": "1",
  "@": "2",
  "#": "3",
  $: "4",
  "%": "5",
  "^": "6",
  "&": "7",
  "*": "8",
  "(": "9",
  ")": "0",
  _: "-",
  "+": "=",
  "{": "[",
  "}": "]",
  "|": "\\",
  ":": ";",
  '"': "'",
  "<": ",",
  ">": ".",
  "?": "/",
};

function oppositeShiftFinger(keyFinger: Finger): Finger | null {
  if (keyFinger === "thumb") {
    return null;
  }
  return keyFinger.startsWith("left_") ? "right_pinky" : "left_pinky";
}

export function getBaseKey(grapheme: string): string | null {
  if (grapheme === " ") {
    return " ";
  }
  if (/^[a-z]$/i.test(grapheme)) {
    return grapheme.toLowerCase();
  }
  const shifted = SHIFTED_TO_BASE[grapheme];
  if (shifted !== undefined) {
    return shifted;
  }
  if (KEY_TO_FINGER[grapheme] !== undefined) {
    return grapheme;
  }
  return null;
}

export function getFingerForKey(grapheme: string): Finger | null {
  const baseKey = getBaseKey(grapheme);
  if (baseKey === null) {
    return null;
  }
  return KEY_TO_FINGER[baseKey] ?? null;
}

export function getFingerAssignment(grapheme: string): FingerAssignment {
  const baseKey = getBaseKey(grapheme);
  const keyFinger = baseKey === null ? null : (KEY_TO_FINGER[baseKey] ?? null);
  const isUpperLetter = /^[A-Z]$/.test(grapheme);
  const needsShift = isUpperLetter || grapheme in SHIFTED_TO_BASE;

  return {
    baseKey,
    keyFinger,
    shiftFinger: needsShift && keyFinger ? oppositeShiftFinger(keyFinger) : null,
    needsShift,
  };
}

export function getHomeRowFingers(): Record<string, Finger> {
  return {
    a: "left_pinky",
    s: "left_ring",
    d: "left_middle",
    f: "left_index",
    j: "right_index",
    k: "right_middle",
    l: "right_ring",
    ";": "right_pinky",
  };
}

export const US_QWERTY_ROWS = {
  number: ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  top: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"],
  home: ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  bottom: ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
} as const;

export const HOME_ROW_BUMP_KEYS = ["f", "j"] as const;

export type ModifierKeyId = "shift-left" | "shift-right" | "space";

export function getModifierFinger(id: ModifierKeyId): Finger {
  if (id === "shift-left") {
    return "left_pinky";
  }
  if (id === "shift-right") {
    return "right_pinky";
  }
  return "thumb";
}
