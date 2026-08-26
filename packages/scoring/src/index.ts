/**
 * Scoring package public API.
 * Stars, XP, mastery, and weak-key selection land in Phases 5–6.
 *
 * Thresholds below match PROJECT.md and must stay in sync with that document.
 */

export const PACKAGE_NAME = "@keypath/scoring";

export const STAR_ACCURACY = {
  one: 0.9,
  two: 0.95,
  three: 0.98,
} as const;

export const STAR_CONSISTENCY_FOR_THREE = 70;
