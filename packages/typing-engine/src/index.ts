/**
 * Typing engine public API.
 * Full keystroke processing lands in Phase 1.
 */

export const PACKAGE_NAME = "@keypath/typing-engine";

export function createTypingSessionPlaceholder(): { status: "uninitialized" } {
  return { status: "uninitialized" };
}
