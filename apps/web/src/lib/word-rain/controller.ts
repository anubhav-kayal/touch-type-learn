import { applyKeyStatDelta } from "@keypath/scoring";
import type { GuestKeyStat } from "@keypath/shared-types";
import {
  calculateAccuracy,
  calculateConsistency,
  calculateWpm,
  createTypingSession,
  type TypingSession,
  type TypingSnapshot,
} from "@keypath/typing-engine";

export const WORD_RAIN_LIVES = 3;
export const WORD_RAIN_MAX_ON_SCREEN = 4;
export const WORD_RAIN_FALL_MS_START = 7800;
export const WORD_RAIN_FALL_MS_FLOOR = 3400;
export const WORD_RAIN_SPAWN_MS_START = 2100;
export const WORD_RAIN_SPAWN_MS_FLOOR = 900;

export interface FallingWord {
  id: string;
  text: string;
  x: number;
  bornAt: number;
  fallMs: number;
}

export type WordRainStatus = "idle" | "running" | "over";

export type WordRainKeyResult =
  | { kind: "ignored" }
  | { kind: "error" }
  | { kind: "locked"; wordId: string }
  | { kind: "progress"; wordId: string }
  | { kind: "caught"; wordId: string; text: string }
  | { kind: "unlock" };

export interface WordRainHud {
  status: WordRainStatus;
  lives: number;
  caught: number;
  missed: number;
  lockedId: string | null;
  lockedCursor: number;
  words: FallingWord[];
}

export function wordY(word: FallingWord, now: number): number {
  if (word.fallMs <= 0) {
    return 1;
  }
  return Math.max(0, (now - word.bornAt) / word.fallMs);
}

function toGuestKeyStat(snapshot: TypingSnapshot): Record<string, GuestKeyStat> {
  const next: Record<string, GuestKeyStat> = {};
  for (const row of Object.values(snapshot.keyStats)) {
    next[row.key] = {
      key: row.key,
      attempts: row.attempts,
      correct: row.correct,
      errors: row.errors,
      averageLatencyMs: row.averageLatencyMs,
    };
  }
  return next;
}

export class WordRainController {
  private readonly pool: string[];
  private readonly now: () => number;
  private readonly rng: () => number;
  private readonly fallScale: number;
  private seq = 0;
  private words: FallingWord[] = [];
  private lockedId: string | null = null;
  private session: TypingSession | null = null;
  private lives = WORD_RAIN_LIVES;
  private caught = 0;
  private missed = 0;
  private status: WordRainStatus = "idle";
  private startedAt: number | null = null;
  private lastKeyAt: number | null = null;
  private lastSpawnAt = 0;
  private readonly ikis: number[] = [];
  private keyStats: Record<string, GuestKeyStat> = {};
  private correctKeystrokes = 0;
  private errorKeystrokes = 0;
  private correctedErrors = 0;
  private maxCombo = 0;
  private correctSlots = 0;
  private allTyped = 0;

  constructor(options: {
    pool: string[];
    now?: () => number;
    rng?: () => number;
    fallScale?: number;
  }) {
    this.pool = options.pool.filter((word) => word.length > 0);
    this.now = options.now ?? (() => performance.now());
    this.rng = options.rng ?? Math.random;
    this.fallScale = options.fallScale ?? 1;
  }

  start(): void {
    this.seq = 0;
    this.words = [];
    this.lockedId = null;
    this.session = null;
    this.lives = WORD_RAIN_LIVES;
    this.caught = 0;
    this.missed = 0;
    this.status = "running";
    this.startedAt = null;
    this.lastKeyAt = null;
    this.ikis.length = 0;
    this.keyStats = {};
    this.correctKeystrokes = 0;
    this.errorKeystrokes = 0;
    this.correctedErrors = 0;
    this.maxCombo = 0;
    this.correctSlots = 0;
    this.allTyped = 0;
    const t = this.now();
    this.lastSpawnAt = t;
    this.spawn(t);
  }

  spawnAt(text: string, opts: { x?: number; fallMs?: number; at?: number } = {}): FallingWord | null {
    if (this.status !== "running" || this.words.length >= WORD_RAIN_MAX_ON_SCREEN) {
      return null;
    }
    const at = opts.at ?? this.now();
    const word: FallingWord = {
      id: `rain-${this.seq}`,
      text,
      x: opts.x ?? 0.08 + this.rng() * 0.72,
      bornAt: at,
      fallMs: opts.fallMs ?? this.fallMs(),
    };
    this.seq += 1;
    this.words.push(word);
    this.lastSpawnAt = at;
    return word;
  }

  tick(at?: number): { missed: FallingWord[]; spawned: FallingWord | null } {
    if (this.status !== "running") {
      return { missed: [], spawned: null };
    }
    const now = at ?? this.now();
    const missed: FallingWord[] = [];
    for (const word of [...this.words]) {
      if (wordY(word, now) < 1) {
        continue;
      }
      missed.push(word);
      this.missWord(word);
    }
    let spawned: FallingWord | null = null;
    if (
      this.status === "running" &&
      this.words.length < WORD_RAIN_MAX_ON_SCREEN &&
      now - this.lastSpawnAt >= this.spawnMs()
    ) {
      spawned = this.spawn(now);
    }
    return { missed, spawned };
  }

  handleKey(raw: string, at?: number): WordRainKeyResult {
    if (this.status !== "running") {
      return { kind: "ignored" };
    }
    const key = raw.length === 0 ? "" : raw[0]!;
    if (key.length !== 1) {
      return { kind: "ignored" };
    }
    const now = at ?? this.now();
    this.noteTiming(now);

    if (this.session && this.lockedId) {
      const snapshot = this.session.handleKey(key, now);
      this.maxCombo = Math.max(this.maxCombo, snapshot.maxCombo);
      if (snapshot.isComplete) {
        return this.catchLocked(snapshot);
      }
      return { kind: "progress", wordId: this.lockedId };
    }

    const candidates = this.words.filter(
      (word) => word.text.startsWith(key) && wordY(word, now) < 1,
    );
    if (candidates.length === 0) {
      this.errorKeystrokes += 1;
      this.allTyped += 1;
      return { kind: "error" };
    }
    const target = candidates.reduce((best, word) =>
      wordY(word, now) > wordY(best, now) ? word : best,
    );
    this.lockedId = target.id;
    this.session = createTypingSession({
      expected: target.text,
      inputMode: "forced-correction",
      now: () => this.now(),
    });
    const snapshot = this.session.handleKey(key, now);
    this.maxCombo = Math.max(this.maxCombo, snapshot.maxCombo);
    if (snapshot.isComplete) {
      return this.catchLocked(snapshot);
    }
    return { kind: "locked", wordId: target.id };
  }

  handleBackspace(at?: number): WordRainKeyResult {
    if (this.status !== "running" || !this.session || !this.lockedId) {
      return { kind: "ignored" };
    }
    const now = at ?? this.now();
    const snapshot = this.session.handleBackspace(now);
    if (snapshot.cursor === 0 && !snapshot.hasPendingError) {
      this.lockedId = null;
      this.session = null;
      return { kind: "unlock" };
    }
    return { kind: "progress", wordId: this.lockedId };
  }

  wordById(id: string): FallingWord | undefined {
    return this.words.find((word) => word.id === id);
  }

  hud(): WordRainHud {
    return {
      status: this.status,
      lives: this.lives,
      caught: this.caught,
      missed: this.missed,
      lockedId: this.lockedId,
      lockedCursor: this.session?.getSnapshot().cursor ?? 0,
      words: this.words.map((word) => ({ ...word })),
    };
  }

  lockedSnapshot(): TypingSnapshot | null {
    return this.session ? this.session.getSnapshot() : null;
  }

  results(endedAt?: number) {
    const now = endedAt ?? this.now();
    const durationMs =
      this.startedAt === null ? 0 : Math.max(0, now - this.startedAt);
    const { wpm, rawWpm } = calculateWpm(this.correctSlots, this.allTyped, durationMs);
    return {
      caught: this.caught,
      missed: this.missed,
      lives: this.lives,
      durationMs,
      wpm,
      rawWpm,
      accuracy: calculateAccuracy(this.correctKeystrokes, this.errorKeystrokes),
      consistency: calculateConsistency(this.ikis),
      maxCombo: this.maxCombo,
      correctedErrors: this.correctedErrors,
      errors: this.errorKeystrokes,
      keyStats: { ...this.keyStats },
    };
  }

  private spawn(at: number): FallingWord | null {
    if (this.pool.length === 0) {
      return null;
    }
    const text = this.pool[Math.min(this.pool.length - 1, Math.floor(this.rng() * this.pool.length))]!;
    return this.spawnAt(text, { at });
  }

  private fallMs(): number {
    return Math.max(WORD_RAIN_FALL_MS_FLOOR, WORD_RAIN_FALL_MS_START - this.caught * 160) * this.fallScale;
  }

  private spawnMs(): number {
    return Math.max(WORD_RAIN_SPAWN_MS_FLOOR, WORD_RAIN_SPAWN_MS_START - this.caught * 50);
  }

  private missWord(word: FallingWord): void {
    this.words = this.words.filter((item) => item.id !== word.id);
    if (this.lockedId === word.id && this.session) {
      this.mergeSession(this.session.getSnapshot());
      this.lockedId = null;
      this.session = null;
    }
    this.missed += 1;
    this.lives -= 1;
    if (this.lives <= 0) {
      this.status = "over";
    }
  }

  private catchLocked(snapshot: TypingSnapshot): WordRainKeyResult {
    const word = this.words.find((item) => item.id === this.lockedId);
    const text = word?.text ?? snapshot.expected.join("");
    const wordId = this.lockedId ?? "";
    this.mergeSession(snapshot);
    this.words = this.words.filter((item) => item.id !== this.lockedId);
    this.lockedId = null;
    this.session = null;
    this.caught += 1;
    return { kind: "caught", wordId, text };
  }

  private mergeSession(snapshot: TypingSnapshot): void {
    this.correctKeystrokes += snapshot.correctKeystrokes;
    this.errorKeystrokes += snapshot.errorKeystrokes;
    this.correctedErrors += snapshot.correctedErrors;
    this.maxCombo = Math.max(this.maxCombo, snapshot.maxCombo);
    this.correctSlots += snapshot.statuses.filter((status) => status === "correct").length;
    this.allTyped += snapshot.correctKeystrokes + snapshot.errorKeystrokes;
    const incoming = toGuestKeyStat(snapshot);
    for (const row of Object.values(incoming)) {
      this.keyStats[row.key] = applyKeyStatDelta(this.keyStats[row.key], row);
    }
  }

  private noteTiming(now: number): void {
    if (this.startedAt === null) {
      this.startedAt = now;
    }
    if (this.lastKeyAt !== null) {
      this.ikis.push(now - this.lastKeyAt);
    }
    this.lastKeyAt = now;
  }
}
