import {
  HOME_ROW_BUMP_KEYS,
  US_QWERTY_ROWS,
  getBaseKey,
} from "@keypath/typing-engine";
import type { FingerAssignment } from "@keypath/typing-engine";
import { resolveKeyState } from "./resolveKeyState";
import type { VirtualKeyState } from "./resolveKeyState";

export interface VirtualKeyboardProps {
  targetGrapheme: string | null;
  currentFinger: FingerAssignment | null;
  hasPendingError: boolean;
  pressedBaseKey: string | null;
}

const KEY_STATE_CLASS: Record<VirtualKeyState, string> = {
  default:
    "bg-keycap text-legend border-black/8 shadow-[0_2px_0_rgba(21,32,43,0.12)]",
  target:
    "bg-bump text-ink border-bump-ink/20 shadow-[0_2px_0_rgba(152,118,12,0.45)]",
  pressed: "bg-ink text-desk translate-y-[2px] shadow-none border-ink",
  finger: "bg-keycap text-ink border-bump/70 shadow-[0_2px_0_rgba(21,32,43,0.12)]",
  incorrect:
    "bg-incorrect/15 text-incorrect border-incorrect shadow-[0_2px_0_rgba(179,58,58,0.35)]",
  shift:
    "bg-bump/40 text-ink border-bump shadow-[0_2px_0_rgba(152,118,12,0.3)]",
};

function KeyCap({
  id,
  label,
  wide,
  bump,
  state,
}: {
  id: string;
  label: string;
  wide?: string;
  bump?: boolean;
  state: VirtualKeyState;
}) {
  return (
    <div
      data-key={id}
      data-state={state}
      className={[
        "relative flex h-10 items-end justify-center rounded-[7px] border pb-1.5 font-mono text-[11px] font-medium leading-none",
        wide ?? "w-8",
        KEY_STATE_CLASS[state],
      ].join(" ")}
    >
      {label}
      {bump ? (
        <span
          aria-hidden="true"
          className="absolute top-1.5 left-1/2 h-1 w-2.5 -translate-x-1/2 rounded-full bg-bump-ink/70"
        />
      ) : null}
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
    <div className="flex w-full max-w-[44rem] flex-col items-center gap-1.5" aria-hidden="true">
      <div className="flex gap-1">
        {US_QWERTY_ROWS.number.map((key) => (
          <KeyCap key={key} id={key} label={key} state={resolve(key)} />
        ))}
      </div>
      <div className="flex gap-1 pl-4">
        {US_QWERTY_ROWS.top.map((key) => (
          <KeyCap key={key} id={key} label={key} state={resolve(key)} />
        ))}
      </div>
      <div className="flex gap-1 pl-6">
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
      <div className="flex gap-1">
        <KeyCap id="shift-left" label="shift" wide="w-14" state={resolve("shift-left")} />
        {US_QWERTY_ROWS.bottom.map((key) => (
          <KeyCap key={key} id={key} label={key} state={resolve(key)} />
        ))}
        <KeyCap
          id="shift-right"
          label="shift"
          wide="w-14"
          state={resolve("shift-right")}
        />
      </div>
      <div className="flex w-full justify-center pt-0.5">
        <KeyCap id=" " label="" wide="w-64" state={resolve(" ")} />
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
