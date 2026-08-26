import { STAR_ACCURACY, STAR_CONSISTENCY_FOR_THREE } from "./thresholds";

export function calculateStars(
  accuracy: number,
  consistency: number | null,
  options?: { wpm?: number; targetWpm?: number },
): 0 | 1 | 2 | 3 {
  if (accuracy < STAR_ACCURACY.one) {
    return 0;
  }
  if (accuracy < STAR_ACCURACY.two) {
    return 1;
  }
  if (accuracy < STAR_ACCURACY.three) {
    return 2;
  }

  const speedOk =
    options?.targetWpm === undefined ||
    (options.wpm !== undefined && options.wpm >= options.targetWpm);
  if (!speedOk) {
    return 2;
  }

  if (consistency === null) {
    return accuracy >= 0.99 ? 3 : 2;
  }

  return consistency >= STAR_CONSISTENCY_FOR_THREE ? 3 : 2;
}
