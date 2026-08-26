export function calculateAccuracy(
  correctKeystrokes: number,
  errorKeystrokes: number,
): number {
  const total = correctKeystrokes + errorKeystrokes;
  if (total === 0) {
    return 1;
  }
  return correctKeystrokes / total;
}
