import { calculateAccuracy } from "./calculateAccuracy";
import { calculateConsistency } from "./calculateConsistency";
import { calculateWpm } from "./calculateWpm";
import { getFingerAssignment } from "./fingerMapping";
import { firstGrapheme, segmentGraphemes } from "./graphemes";
import { createKeyTracker, recordKeyAttempt, summarizeKeyStats } from "./keyTracking";
import {
  createComboState,
  registerBackspaceOfCorrect,
  registerCorrect,
  registerError,
} from "./mistakeTracking";
import { defaultNow } from "./timing";
import type {
  CharStatus,
  CreateSessionOptions,
  InputMode,
  NowFn,
  TypingSnapshot,
} from "./types";

export class TypingSession {
  private readonly expected: string[];
  private readonly inputMode: InputMode;
  private readonly now: NowFn;
  private readonly statuses: CharStatus[];
  private readonly slotHadError: boolean[];
  private readonly keyStats = createKeyTracker();
  private readonly comboState = createComboState();
  private readonly ikis: number[] = [];

  private cursor = 0;
  private pendingError = false;
  private correctKeystrokes = 0;
  private errorKeystrokes = 0;
  private correctedErrors = 0;
  private startedAt: number | null = null;
  private completedAt: number | null = null;
  private lastCharAt: number | null = null;

  constructor(options: CreateSessionOptions) {
    this.expected = segmentGraphemes(options.expected);
    this.inputMode = options.inputMode ?? "forced-correction";
    this.now = options.now ?? defaultNow;
    this.statuses = this.expected.map(() => "pending");
    this.slotHadError = this.expected.map(() => false);
    if (this.expected.length === 0) {
      this.completedAt = this.now();
    }
  }

  handleKey(rawInput: string, at?: number): TypingSnapshot {
    const time = at ?? this.now();
    if (this.isComplete()) {
      return this.getSnapshot(time);
    }

    const input = firstGrapheme(rawInput);
    if (input === null) {
      return this.getSnapshot(time);
    }

    const expectedChar = this.expected[this.cursor];
    if (expectedChar === undefined) {
      return this.getSnapshot(time);
    }

    if (this.inputMode === "forced-correction" && this.pendingError) {
      this.errorKeystrokes += 1;
      this.recordTiming(time);
      recordKeyAttempt(this.keyStats, expectedChar, input, false, this.latestIki());
      return this.getSnapshot(time);
    }

    this.recordTiming(time);
    const latency = this.latestIki();
    const correct = input === expectedChar;

    if (correct) {
      this.statuses[this.cursor] = "correct";
      this.correctKeystrokes += 1;
      registerCorrect(this.comboState);
      if (this.slotHadError[this.cursor]) {
        this.correctedErrors += 1;
      }
      recordKeyAttempt(this.keyStats, expectedChar, input, true, latency);
      this.pendingError = false;
      this.cursor += 1;
      if (this.cursor >= this.expected.length) {
        this.completedAt = time;
      }
      return this.getSnapshot(time);
    }

    this.statuses[this.cursor] = "incorrect";
    this.errorKeystrokes += 1;
    this.slotHadError[this.cursor] = true;
    registerError(this.comboState);
    recordKeyAttempt(this.keyStats, expectedChar, input, false, latency);

    if (this.inputMode === "forced-correction") {
      this.pendingError = true;
    } else {
      this.cursor += 1;
      if (this.cursor >= this.expected.length) {
        this.completedAt = time;
      }
    }

    return this.getSnapshot(time);
  }

  handleBackspace(at?: number): TypingSnapshot {
    const time = at ?? this.now();
    if (this.completedAt !== null && this.expected.length === 0) {
      return this.getSnapshot(time);
    }

    if (this.inputMode === "forced-correction" && this.pendingError) {
      const current = this.expected[this.cursor];
      if (current !== undefined) {
        this.statuses[this.cursor] = "pending";
      }
      this.pendingError = false;
      this.completedAt = null;
      return this.getSnapshot(time);
    }

    if (this.cursor === 0) {
      return this.getSnapshot(time);
    }

    this.cursor -= 1;
    const previousStatus = this.statuses[this.cursor];
    if (previousStatus === "correct") {
      registerBackspaceOfCorrect(this.comboState);
    }
    this.statuses[this.cursor] = "pending";
    this.pendingError = false;
    this.completedAt = null;
    return this.getSnapshot(time);
  }

  getSnapshot(at?: number): TypingSnapshot {
    const time = this.completedAt ?? at ?? this.now();
    const durationMs = this.startedAt === null ? 0 : Math.max(0, time - this.startedAt);
    const correctChars = this.statuses.filter((status) => status === "correct").length;
    const allTypedChars = this.correctKeystrokes + this.errorKeystrokes;
    const { wpm, rawWpm } = calculateWpm(correctChars, allTypedChars, durationMs);
    const currentExpected = this.isComplete()
      ? null
      : (this.expected[this.cursor] ?? null);

    return {
      expected: [...this.expected],
      statuses: [...this.statuses],
      cursor: this.cursor,
      inputMode: this.inputMode,
      isComplete: this.isComplete(),
      hasPendingError: this.pendingError,
      currentExpected,
      currentFinger: currentExpected ? getFingerAssignment(currentExpected) : null,
      correctKeystrokes: this.correctKeystrokes,
      errorKeystrokes: this.errorKeystrokes,
      correctedErrors: this.correctedErrors,
      combo: this.comboState.combo,
      maxCombo: this.comboState.maxCombo,
      durationMs,
      wpm,
      rawWpm,
      accuracy: calculateAccuracy(this.correctKeystrokes, this.errorKeystrokes),
      consistency: calculateConsistency(this.ikis),
      keyStats: summarizeKeyStats(this.keyStats),
    };
  }

  private isComplete(): boolean {
    return this.completedAt !== null || this.cursor >= this.expected.length;
  }

  private recordTiming(time: number): void {
    if (this.startedAt === null) {
      this.startedAt = time;
    }
    if (this.lastCharAt !== null) {
      this.ikis.push(time - this.lastCharAt);
    }
    this.lastCharAt = time;
  }

  private latestIki(): number | null {
    const iki = this.ikis[this.ikis.length - 1];
    return iki === undefined ? null : iki;
  }
}

export function createTypingSession(options: CreateSessionOptions): TypingSession {
  return new TypingSession(options);
}
