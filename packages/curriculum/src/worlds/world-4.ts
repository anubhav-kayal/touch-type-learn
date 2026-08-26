import { defineLesson } from "../define";
import { typing } from "../generate";
import type { World } from "../types";

const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

export const world4: World = {
  id: "world-4",
  title: "Real Words",
  description: "Common English, doubles, and awkward pairs.",
  sortOrder: 4,
  status: "partial",
  lessons: [
    defineLesson({
      id: "w4-common",
      worldId: "world-4",
      title: "Common words",
      newKeys: [],
      allowedKeys: LETTERS,
      assistance: "on-error",
      exercises: [
        {
          type: "introduction",
          title: "Words you already meet",
          body: "The keyboard is hidden until a miss. These are high-frequency English words.",
        },
        typing("word", "the of and to in is you that it", LETTERS),
        typing("word", "for on are as with his they", LETTERS),
        typing("challenge", "the more you type the better you get", LETTERS),
      ],
    }),
    defineLesson({
      id: "w4-double",
      worldId: "world-4",
      title: "Double letters",
      newKeys: [],
      allowedKeys: LETTERS,
      assistance: "on-error",
      exercises: [
        {
          type: "introduction",
          title: "Same key twice",
          body: "Do not bounce off the key. Press again with control: ll, ee, ss, oo, pp.",
        },
        typing("word", "letter little happy book seem", LETTERS),
        typing("word", "school coffee success", LETTERS),
        typing("challenge", "little letters seem happy", LETTERS),
      ],
    }),
    defineLesson({
      id: "w4-hard-pairs",
      worldId: "world-4",
      title: "Awkward pairs",
      newKeys: [],
      allowedKeys: LETTERS,
      assistance: "on-error",
      exercises: [
        {
          type: "introduction",
          title: "Same-hand stretches",
          body: "th, st, and rk often slow people down. Keep the rhythm even.",
        },
        typing("pattern", "th th st st rk rk", LETTERS),
        typing("word", "think three streets work", LETTERS),
        typing("challenge", "think three dark streets", LETTERS),
      ],
    }),
  ],
};
