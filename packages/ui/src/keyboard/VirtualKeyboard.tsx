import {
  HOME_ROW_BUMP_KEYS,
  US_QWERTY_ROWS,
  getBaseKey,
} from "@keypath/typing-engine";
import type { FingerAssignment } from "@keypath/typing-engine";
import { resolveKeyState } from "./resolveKeyState";

export interface VirtualKeyboardProps {
  targetGrapheme: string | null;
  currentFinger: FingerAssignment | null;
  hasPendingError: boolean;
  pressedBaseKey: string | null;
}

function KeyCap({
  id,
  label,
  kind = "unit",
  bump,
  state,
}: {
  id: string;
  label: string;
  kind?: "unit" | "shift" | "space";
  bump?: boolean;
  state: string;
}) {
  return (
    <div
      data-key={id}
      data-state={state}
      className={["keypath-kb__key", kind === "unit" ? "" : `keypath-kb__key--${kind}`]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
      {bump ? <span className="keypath-kb__bump" aria-hidden="true" /> : null}
    </div>
  );
}

export function VirtualKeyboard({
  targetGrapheme,
  currentFinger,
  hasPendingError,
  pressedBaseKey,
}: VirtualKeyboardProps) {
  const targetBaseKey = targetGrapheme ? getBaseKey(targetGrapheme) : null;
  const resolve = (keyId: string) =>
    resolveKeyState({
      keyId,
      targetBaseKey,
      targetFinger: currentFinger?.keyFinger ?? null,
      shiftFinger: currentFinger?.shiftFinger ?? null,
      needsShift: currentFinger?.needsShift ?? false,
      pressedBaseKey,
      hasPendingError,
    });

  return (
    <div className="keypath-kb" aria-hidden="true" data-testid="virtual-keyboard">
      <div className="keypath-kb__mat">
        <div className="keypath-kb__row">
          {US_QWERTY_ROWS.number.map((key) => (
            <KeyCap key={key} id={key} label={key} state={resolve(key)} />
          ))}
        </div>
        <div className="keypath-kb__row keypath-kb__row--top">
          {US_QWERTY_ROWS.top.map((key) => (
            <KeyCap key={key} id={key} label={key} state={resolve(key)} />
          ))}
        </div>
        <div className="keypath-kb__row keypath-kb__row--home">
          {US_QWERTY_ROWS.home.map((key) => (
            <KeyCap
              key={key}
              id={key}
              label={key}
              bump={(HOME_ROW_BUMP_KEYS as readonly string[]).includes(key)}
              state={resolve(key)}
            />
          ))}
        </div>
        <div className="keypath-kb__row">
          <KeyCap id="shift-left" label="shift" kind="shift" state={resolve("shift-left")} />
          {US_QWERTY_ROWS.bottom.map((key) => (
            <KeyCap key={key} id={key} label={key} state={resolve(key)} />
          ))}
          <KeyCap id="shift-right" label="shift" kind="shift" state={resolve("shift-right")} />
        </div>
        <div className="keypath-kb__row">
          <KeyCap id=" " label="" kind="space" state={resolve(" ")} />
        </div>
      </div>
    </div>
  );
}

export function pressedKeyFromEventKey(key: string): string | null {
  if (key === "Shift") {
    return null;
  }
  if (key === " ") {
    return " ";
  }
  return getBaseKey(key);
}
