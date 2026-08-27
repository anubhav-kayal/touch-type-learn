import { LEVEL_XP_BASE, LEVEL_XP_EXPONENT } from "./thresholds";

const LEVEL_CAP = 200;

/** XP needed to go from level `n - 1` to `n`. Level 1 costs 0. */
export function xpRequiredToReach(level: number): number {
  if (level <= 1) {
    return 0;
  }
  return Math.floor(LEVEL_XP_BASE * level ** LEVEL_XP_EXPONENT);
}

export function levelFromXp(xp: number): number {
  const safeXp = Math.max(0, Math.floor(xp));
  let level = 1;
  let spent = 0;
  while (level < LEVEL_CAP) {
    const cost = xpRequiredToReach(level + 1);
    if (safeXp < spent + cost) {
      return level;
    }
    spent += cost;
    level += 1;
  }
  return level;
}

export function xpProgressInLevel(xp: number): {
  level: number;
  into: number;
  needed: number;
} {
  const level = levelFromXp(xp);
  let spent = 0;
  for (let n = 2; n <= level; n += 1) {
    spent += xpRequiredToReach(n);
  }
  return {
    level,
    into: Math.max(0, Math.floor(xp) - spent),
    needed: xpRequiredToReach(level + 1),
  };
}
