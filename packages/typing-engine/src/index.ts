export { PACKAGE_NAME } from "./types";
export {
  CONSISTENCY_CV_REF,
  CONSISTENCY_MIN_INTERVALS,
  CONSISTENCY_PAUSE_MS,
  KEYBOARD_LAYOUT,
  MS_PER_MINUTE,
  WORD_CHAR_COUNT,
} from "./types";
export type {
  CharStatus,
  CreateSessionOptions,
  Finger,
  FingerAssignment,
  InputMode,
  KeyStatSummary,
  ManualClock,
  NowFn,
  TypingSnapshot,
} from "./types";

export { calculateAccuracy } from "./calculateAccuracy";
export { calculateConsistency } from "./calculateConsistency";
export { calculateWpm } from "./calculateWpm";
export { createTypingSession, TypingSession } from "./engine";
export {
  FINGERS,
  HOME_ROW_BUMP_KEYS,
  US_QWERTY_ROWS,
  getBaseKey,
  getFingerAssignment,
  getFingerForKey,
  getHomeRowFingers,
  getModifierFinger,
} from "./fingerMapping";
export type { ModifierKeyId } from "./fingerMapping";
export { firstGrapheme, segmentGraphemes } from "./graphemes";
export { createManualClock, defaultNow } from "./timing";
