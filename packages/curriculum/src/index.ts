export { PACKAGE_NAME, WORLD_IDS } from "./types";
export type {
  AssistanceLevel,
  Exercise,
  ExerciseType,
  IntroductionExercise,
  Lesson,
  TypingExercise,
  World,
  WorldId,
  WorldStatus,
} from "./types";
export {
  BOTTOM_ROW_LETTERS,
  HOME_ROW_KEYS,
  TOP_ROW_LETTERS,
} from "./types";

export {
  assertAllowedKeys,
  collectDisallowedGraphemes,
  isTypingExercise,
} from "./allowedKeys";
export { alternate, repeats, tokens, typing } from "./generate";
export {
  generateAccuracyDrill,
  generateCommonWordsDrill,
  generateNumbersDrill,
  generatePracticePrompt,
  generatePunctuationDrill,
  generateSpeedDrill,
  generateWeakKeyDrill,
  wordsFittingKeys,
} from "./practice/generate";
export {
  CUSTOM_TEXT_MAX_CHARS,
  CUSTOM_TEXT_MAX_RAW,
  prepareCustomPracticeText,
} from "./practice/customText";
export type { PrepareCustomTextResult } from "./practice/customText";
export {
  NUMBER_KEYS,
  PRACTICE_MODE_IDS,
  PRACTICE_MODES,
  PUNCTUATION_KEYS,
  getPracticeMode,
  isPracticeModeId,
  listPracticeModes,
} from "./practice/modes";
export type { PracticeKeySource, PracticeMode, PracticeModeId } from "./practice/modes";
export { COMMON_PRACTICE_WORDS } from "./practice/words";
export { pickRainWords } from "./practice/rainWords";
export { practiceAllowedKeys } from "./unlockedKeys";
export {
  getCurrentLessonId,
  getNextLessonId,
  isLessonUnlocked,
  listPlayableLessons,
} from "./progress";
export { getLesson, getWorld, getWorlds, LESSON_ALIASES, WORLDS } from "./catalog";
export {
  getLessonSeedRows,
  getWorldSeedRows,
  renderCurriculumSeedSql,
} from "./seed";
export type { LessonSeedRow, WorldSeedRow } from "./seed";
