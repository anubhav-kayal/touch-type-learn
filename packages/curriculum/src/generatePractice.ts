import { assertAllowedKeys } from "./allowedKeys";
import { segmentGraphemes } from "@keypath/typing-engine";

function defaultRng(): number {
  return Math.random();
}

function pickIndex(length: number, rng: () => number): number {
  if (length <= 0) {
    return 0;
  }
  return Math.min(length - 1, Math.floor(rng() * length));
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
