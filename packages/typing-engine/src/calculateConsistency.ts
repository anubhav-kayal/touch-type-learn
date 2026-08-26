import {
  CONSISTENCY_CV_REF,
  CONSISTENCY_MIN_INTERVALS,
  CONSISTENCY_PAUSE_MS,
} from "./types";

function sampleStdDev(values: number[], mean: number): number {
  if (values.length < 2) {
    return 0;
  }
  const sumSquares = values.reduce((sum, value) => {
    const delta = value - mean;
    return sum + delta * delta;
  }, 0);
  return Math.sqrt(sumSquares / (values.length - 1));
}

export function calculateConsistency(ikisMs: readonly number[]): number | null {
  const usable = ikisMs.filter((iki) => iki <= CONSISTENCY_PAUSE_MS && iki >= 0);
  if (usable.length < CONSISTENCY_MIN_INTERVALS) {
    return null;
  }

  const mean = usable.reduce((sum, value) => sum + value, 0) / usable.length;
  if (mean === 0) {
    return null;
  }

  const cv = sampleStdDev(usable, mean) / mean;
  return Math.min(100, Math.max(0, 100 * (1 - cv / CONSISTENCY_CV_REF)));
}
