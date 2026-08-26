import { create } from "zustand";
import type { TypingSnapshot } from "@keypath/typing-engine";

type LessonView = "typing" | "results";

interface LessonUiState {
  view: LessonView;
  result: TypingSnapshot | null;
  runId: number;
  showResults: (result: TypingSnapshot) => void;
  retry: () => void;
}

export const useLessonUiStore = create<LessonUiState>((set) => ({
  view: "typing",
  result: null,
  runId: 0,
  showResults: (result) => set({ view: "results", result }),
  retry: () =>
    set((state) => ({
      view: "typing",
      result: null,
      runId: state.runId + 1,
    })),
}));
