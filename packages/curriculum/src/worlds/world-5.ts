import { defineLesson } from "../define";
import { typing } from "../generate";
import type { World } from "../types";

const LOWER = "abcdefghijklmnopqrstuvwxyz".split("");
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const KEYS = [...LOWER, ...UPPER, ".", ",", "'", "?", "!"];

export const world5: World = {
  id: "world-5",
  title: "Sentences and Rhythm",
  description: "Shift, capitals, and everyday punctuation.",
  sortOrder: 5,
  status: "partial",
  lessons: [
    defineLesson({
      id: "w5-shift",
      worldId: "world-5",
      title: "Shift and capitals",
      newKeys: UPPER.slice(0, 3),
      allowedKeys: KEYS,
      assistance: "on-error",
      exercises: [
        {
          type: "introduction",
          title: "Opposite-hand Shift",
          body: "Hold Shift with the pinky that is not typing the letter. Left letters use right Shift. Right letters use left Shift.",
        },
        typing("key-drill", "A A S S Aa Ss", KEYS),
        typing("word", "Ada The She You", KEYS),
        typing("challenge", "She said Hello", KEYS),
      ],
    }),
    defineLesson({
      id: "w5-comma-period",
      worldId: "world-5",
      title: "Comma and period",
      newKeys: [",", "."],
      allowedKeys: KEYS,
      assistance: "on-error",
      exercises: [
        {
          type: "introduction",
          title: "Pause and stop",
          body: "Comma is right middle, below K. Period is right ring, below L. Space after both.",
        },
        typing("sentence", "Wait, then go.", KEYS),
        typing("sentence", "Yes, I see it.", KEYS),
        typing("challenge", "Stop, look, then type.", KEYS),
      ],
    }),
    defineLesson({
      id: "w5-sentences",
      worldId: "world-5",
      title: "Full sentences",
      newKeys: ["'", "?", "!"],
      allowedKeys: KEYS,
      assistance: "on-error",
      exercises: [
        {
          type: "introduction",
          title: "Questions and emphasis",
          body: "Apostrophe, question mark, and exclamation. Keep Shift honest on the marks that need it.",
        },
        typing("sentence", "Hello, how are you?", KEYS),
        typing("sentence", "It's a good day!", KEYS),
        typing("challenge", "Don't stop. Are you ready?", KEYS),
      ],
    }),
  ],
};
