/**
 * Curriculum package public API.
 * Worlds and lessons land in Phase 3.
 */

export const PACKAGE_NAME = "@keypath/curriculum";

export const WORLD_IDS = [
  "world-1",
  "world-2",
  "world-3",
  "world-4",
  "world-5",
  "world-6",
  "world-7",
  "world-8",
] as const;

export type WorldId = (typeof WORLD_IDS)[number];
