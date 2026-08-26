import type { Finger } from "@keypath/typing-engine";

const LABELS: Record<Finger, string> = {
  left_pinky: "Left pinky",
  left_ring: "Left ring",
  left_middle: "Left middle",
  left_index: "Left index",
  right_index: "Right index",
  right_middle: "Right middle",
  right_ring: "Right ring",
  right_pinky: "Right pinky",
  thumb: "Thumb",
};

export function fingerLabel(finger: Finger | null | undefined): string {
  if (!finger) {
    return "Find the key";
  }
  return LABELS[finger];
}
