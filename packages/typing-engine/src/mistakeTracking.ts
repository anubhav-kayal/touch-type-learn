export interface ComboState {
  combo: number;
  maxCombo: number;
}

export function createComboState(): ComboState {
  return { combo: 0, maxCombo: 0 };
}

export function registerCorrect(state: ComboState): void {
  state.combo += 1;
  if (state.combo > state.maxCombo) {
    state.maxCombo = state.combo;
  }
}

export function registerError(state: ComboState): void {
  state.combo = 0;
}

export function registerBackspaceOfCorrect(state: ComboState): void {
  state.combo = 0;
}
