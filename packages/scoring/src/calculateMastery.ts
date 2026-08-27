import { MASTERY } from "./thresholds";

export function mergeLatencyEma(
  previous: number | null,
  incoming: number | null,
): number | null {
  if (incoming === null) {
    return previous;
  }
  if (previous === null) {
    return incoming;
  }
  return previous * (1 - MASTERY.latencyEmaNew) + incoming * MASTERY.latencyEmaNew;
}

export function latencyScore(averageLatencyMs: number | null, attempts: number): number {
  if (averageLatencyMs === null || attempts < MASTERY.latencyNeutralUntilAttempts) {
    return 50;
  }
  if (averageLatencyMs <= MASTERY.latencyFastMs) {
    return 100;
  }
  if (averageLatencyMs >= MASTERY.latencySlowMs) {
    return 0;
  }
  const span = MASTERY.latencySlowMs - MASTERY.latencyFastMs;
  return 100 * (1 - (averageLatencyMs - MASTERY.latencyFastMs) / span);
}

export interface CalculateMasteryInput {
  attempts: number;
  correct: number;
  averageLatencyMs: number | null;
  recencyAccuracy?: number;
  consistency?: number | null;
}

export function calculateMastery(input: CalculateMasteryInput): number {
  const attempts = Math.max(0, input.attempts);
  const correct = Math.max(0, Math.min(input.correct, attempts));
  const bayesianAccuracy =
    (correct + MASTERY.priorCorrect) / (attempts + MASTERY.priorAttempts);
  const confidence = 1 - Math.exp(-attempts / MASTERY.confidenceScale);
  const accuracyScore = bayesianAccuracy * 100;
  const recency =
    input.recencyAccuracy === undefined
      ? attempts > 0
        ? correct / attempts
        : 0.5
      : Math.min(1, Math.max(0, input.recencyAccuracy));
  const recencyScore = recency * 100;
  const consistencyScore =
    input.consistency === null || input.consistency === undefined
      ? accuracyScore
      : Math.min(100, Math.max(0, input.consistency));
  const inner =
    MASTERY.weights.accuracy * accuracyScore +
    MASTERY.weights.latency * latencyScore(input.averageLatencyMs, attempts) +
    MASTERY.weights.recency * recencyScore +
    MASTERY.weights.consistency * consistencyScore;
  return confidence * inner;
}
