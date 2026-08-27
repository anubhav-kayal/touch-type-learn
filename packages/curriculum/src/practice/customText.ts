import { segmentGraphemes } from "@keypath/typing-engine";
import { collectDisallowedGraphemes } from "../allowedKeys";

/** Reject pastes larger than this before sanitizing. */
export const CUSTOM_TEXT_MAX_RAW = 2000;
/** Maximum graphemes kept after sanitizing. */
export const CUSTOM_TEXT_MAX_CHARS = 400;

const US_QWERTY_TYPEABLE = new Set([
  ..."abcdefghijklmnopqrstuvwxyz",
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  ..."0123456789",
  " ",
  "`",
  "-",
  "=",
  "[",
  "]",
  "\\",
  ";",
  "'",
  ",",
  ".",
  "/",
  "~",
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "_",
  "+",
  "{",
  "}",
  "|",
  ":",
  '"',
  "<",
  ">",
  "?",
]);

const QUOTE_MAP: Record<string, string> = {
  "\u2018": "'",
  "\u2019": "'",
  "\u201A": "'",
  "\u201B": "'",
  "\u201C": '"',
  "\u201D": '"',
  "\u00AB": '"',
  "\u00BB": '"',
};

function normalizeGrapheme(grapheme: string): string {
  if (QUOTE_MAP[grapheme]) {
    return QUOTE_MAP[grapheme]!;
  }
  if (grapheme === "\u2013" || grapheme === "\u2014" || grapheme === "\u2212") {
    return "-";
  }
  if (grapheme === "\u2026") {
    return "...";
  }
  if (grapheme === "\n" || grapheme === "\r" || grapheme === "\t" || grapheme === "\u00A0" || grapheme === "\u202F") {
    return " ";
  }
  return grapheme;
}

export type PrepareCustomTextResult =
  | { ok: true; prompt: string; dropped: string[] }
  | { ok: false; error: "empty" | "too-long" | "no-typeable"; dropped: string[] };

export function prepareCustomPracticeText(raw: string): PrepareCustomTextResult {
  if (raw.length > CUSTOM_TEXT_MAX_RAW) {
    return { ok: false, error: "too-long", dropped: [] };
  }

  const dropped: string[] = [];
  const kept: string[] = [];
  for (const grapheme of segmentGraphemes(raw)) {
    const normalized = normalizeGrapheme(grapheme);
    for (const piece of segmentGraphemes(normalized)) {
      if (US_QWERTY_TYPEABLE.has(piece)) {
        kept.push(piece);
      } else if (piece !== "") {
        if (!dropped.includes(piece)) {
          dropped.push(piece);
        }
      }
    }
  }

  const prompt = kept.join("").replace(/[ ]+/g, " ").trim();
  if (prompt.length === 0) {
    return {
      ok: false,
      error: raw.trim().length === 0 ? "empty" : "no-typeable",
      dropped,
    };
  }
  if (segmentGraphemes(prompt).length > CUSTOM_TEXT_MAX_CHARS) {
    return { ok: false, error: "too-long", dropped };
  }

  const extras = [" "];
  const stillDisallowed = collectDisallowedGraphemes(prompt, [...US_QWERTY_TYPEABLE], extras);
  if (stillDisallowed.length > 0) {
    return { ok: false, error: "no-typeable", dropped: [...dropped, ...stillDisallowed] };
  }

  return { ok: true, prompt, dropped };
}
