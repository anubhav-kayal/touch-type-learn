import type { AttemptPoint, DailyChallengeId, DailyChallengeState } from "@keypath/shared-types";
import { XP } from "./thresholds";
import { utcDateString } from "./utcDate";

export const TIMED_PB_MS = 60_000;
export const WORDS_CHARACTERS = 5;
const EMPTY_DATE = "1970-01-01";

export interface DailyChallengeDef {
  id: DailyChallengeId;
  title: string;
  description: string;
  target: number;
  href: string;
}

export const DAILY_CHALLENGES: Record<DailyChallengeId, DailyChallengeDef> = {
  "words-200": {
    id: "words-200",
    title: "200 accurate words",
    description: "Type 200 words at 95% accuracy or better.",
    target: 200,
    href: "/learn",
  },
  "weak-keys-3": {
    id: "weak-keys-3",
    title: "Three weak-key drills",
    description: "Finish three weak-key practice drills today.",
    target: 3,
    href: "/practice/weak-keys",
  },
  "lessons-3": {
    id: "lessons-3",
    title: "Three lessons",
    description: "Pass three lessons today.",
    target: 3,
    href: "/learn",
  },
  "pb-60s": {
    id: "pb-60s",
    title: "Beat a 60s best",
    description: "Beat your best WPM on a session of at least 60 seconds.",
    target: 1,
    href: "/learn",
  },
};

const DAILY_ORDER: DailyChallengeId[] = [
  "words-200",
  "weak-keys-3",
  "lessons-3",
  "pb-60s",
];

export function isDailyChallengeId(value: string): value is DailyChallengeId {
  return DAILY_ORDER.includes(value as DailyChallengeId);
}

export function getDailyChallenge(id: DailyChallengeId): DailyChallengeDef {
  return DAILY_CHALLENGES[id];
}

function hashUtcDate(date: string): number {
  let hash = 2166136261;
  for (let i = 0; i < date.length; i += 1) {
    hash ^= date.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function challengeForUtcDate(date: string): DailyChallengeDef {
  const id = DAILY_ORDER[hashUtcDate(date) % DAILY_ORDER.length] ?? "words-200";
  return DAILY_CHALLENGES[id];
}

export function emptyDailyChallenge(date = EMPTY_DATE): DailyChallengeState {
  const def = challengeForUtcDate(date);
  return {
    date,
    challengeId: def.id,
    progress: 0,
    target: def.target,
    completed: false,
    xpAwarded: false,
  };
}

export function dailyChallengeForNow(
  state: DailyChallengeState | undefined,
  now: Date = new Date(),
): DailyChallengeState {
  const today = utcDateString(now);
  if (state && state.date === today) {
    return state;
  }
  return emptyDailyChallenge(today);
}

export function formatDailyProgress(state: DailyChallengeState): string {
  const current = Math.min(state.progress, state.target);
  if (state.challengeId === "words-200") {
    return `${current} / ${state.target} words`;
  }
  if (state.challengeId === "weak-keys-3") {
    return `${current} / ${state.target} drills`;
  }
  if (state.challengeId === "lessons-3") {
    return `${current} / ${state.target} lessons`;
  }
  return state.completed ? "New 60s best" : "No 60s best yet today";
}

export function maxTimedWpm(
  attempts: readonly AttemptPoint[],
  minDurationMs = TIMED_PB_MS,
): number {
  let best = 0;
  for (const point of attempts) {
    if (point.durationMs >= minDurationMs) {
      best = Math.max(best, point.wpm);
    }
  }
  return best;
}

export interface DailyChallengeEvent {
  characters: number;
  accuracy: number;
  lessonPassed: boolean;
  weakKeyDrill: boolean;
  durationMs: number;
  wpm: number;
  priorTimedBestWpm: number;
}

function nextProgress(state: DailyChallengeState, event: DailyChallengeEvent): number {
  if (state.challengeId === "words-200") {
    if (event.accuracy < 0.95) {
      return state.progress;
    }
    return state.progress + Math.floor(Math.max(0, event.characters) / WORDS_CHARACTERS);
  }
  if (state.challengeId === "weak-keys-3") {
    return event.weakKeyDrill ? state.progress + 1 : state.progress;
  }
  if (state.challengeId === "lessons-3") {
    return event.lessonPassed ? state.progress + 1 : state.progress;
  }
  if (event.durationMs >= TIMED_PB_MS && event.wpm > event.priorTimedBestWpm) {
    return 1;
  }
  return state.progress;
}

export function applyDailyChallenge(
  state: DailyChallengeState | undefined,
  event: DailyChallengeEvent,
  now: Date = new Date(),
): { state: DailyChallengeState; justCompleted: boolean; xp: number } {
  const today = utcDateString(now);
  const current = dailyChallengeForNow(state, now);
  const def = getDailyChallenge(current.challengeId);
  const progress = Math.min(def.target, nextProgress({ ...current, target: def.target }, event));
  const completed = current.completed || progress >= def.target;
  const justCompleted = completed && !current.completed;
  const xpAwarded = current.xpAwarded || justCompleted;
  return {
    state: {
      date: today,
      challengeId: def.id,
      progress,
      target: def.target,
      completed,
      xpAwarded,
    },
    justCompleted,
    xp: justCompleted ? XP.dailyChallenge : 0,
  };
}
