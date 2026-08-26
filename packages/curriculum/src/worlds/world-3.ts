import { defineLesson } from "../define";
import { typing } from "../generate";
import { HOME_ROW_KEYS, TOP_ROW_LETTERS } from "../types";
import type { World } from "../types";

const TOP_HOME = [...HOME_ROW_KEYS, ...TOP_ROW_LETTERS];
const CCOM = [...TOP_HOME, "c", ","];
const VM = [...CCOM, "v", "m"];
const BN = [...VM, "b", "n"];
const XDOT = [...BN, "x", "."];
const ALL = [...XDOT, "z", "/"];

export const world3: World = {
  id: "world-3",
  title: "Bottom Row",
  description: "Finish the alphabet. Reach down, then return home.",
  sortOrder: 3,
  status: "full",
  lessons: [
    defineLesson({
      id: "w3-c-comma",
      worldId: "world-3",
      title: "C and comma",
      newKeys: ["c", ","],
      allowedKeys: CCOM,
      assistance: "minimal",
      exercises: [
        {
          type: "introduction",
          title: "Left middle reaches down",
          body: "C sits below D. Comma sits below K. Reach down, type, return to home row.",
        },
        typing("key-drill", "c c , , c ,", CCOM),
        typing("pattern", "dc k, cd ,k c ,", CCOM),
        typing("word", "cat call case each", CCOM),
        typing("challenge", "call the cat, each case", CCOM),
      ],
    }),
    defineLesson({
      id: "w3-vm",
      worldId: "world-3",
      title: "V and M",
      newKeys: ["v", "m"],
      allowedKeys: VM,
      assistance: "minimal",
      exercises: [
        {
          type: "introduction",
          title: "Index fingers reach down",
          body: "Left index types V (below F). Right index types M (below J).",
        },
        typing("key-drill", "v v m m v m", VM),
        typing("pattern", "fv jm vf mj v m", VM),
        typing("word", "me am have move time", VM),
        typing("challenge", "have me move at a time", VM),
      ],
    }),
    defineLesson({
      id: "w3-bn",
      worldId: "world-3",
      title: "B and N",
      newKeys: ["b", "n"],
      allowedKeys: BN,
      assistance: "minimal",
      exercises: [
        {
          type: "introduction",
          title: "Index fingers stretch down and in",
          body: "Left index types B. Right index types N. These are easy to miss — stay on the bumps first.",
        },
        typing("key-drill", "b b n n b n", BN),
        typing("pattern", "fb jn bf nj b n", BN),
        typing("word", "be an and been near", BN),
        typing("challenge", "and been near a band", BN),
      ],
    }),
    defineLesson({
      id: "w3-x-period",
      worldId: "world-3",
      title: "X and period",
      newKeys: ["x", "."],
      allowedKeys: XDOT,
      assistance: "minimal",
      exercises: [
        {
          type: "introduction",
          title: "Ring fingers reach down",
          body: "X sits below S. Period sits below L. The period ends a thought — type it with the right ring finger.",
        },
        typing("key-drill", "x x . . x .", XDOT),
        typing("pattern", "sx l. xs .l x .", XDOT),
        typing("word", "six box text extra", XDOT),
        typing("challenge", "six. extra text.", XDOT),
      ],
    }),
    defineLesson({
      id: "w3-z-slash",
      worldId: "world-3",
      title: "Z and slash",
      newKeys: ["z", "/"],
      allowedKeys: ALL,
      assistance: "minimal",
      exercises: [
        {
          type: "introduction",
          title: "Pinkies finish the map",
          body: "Left pinky types Z (below A). Right pinky types slash (below semicolon). The alphabet is complete.",
        },
        typing("key-drill", "z z / / z /", ALL),
        typing("pattern", "az ;/ za /; z /", ALL),
        typing("word", "size lazy quiz jazz", ALL),
        typing("challenge", "size / lazy quiz", ALL),
      ],
    }),
    defineLesson({
      id: "w3-boss",
      worldId: "world-3",
      title: "Alphabet mastery",
      newKeys: [],
      allowedKeys: ALL,
      assistance: "minimal",
      isBoss: true,
      exercises: [
        {
          type: "introduction",
          title: "Alphabet boss",
          body: "Every letter, plus comma, period, and slash. Still no capital letters.",
        },
        typing(
          "boss",
          "the lazy cat can jump. box and size / next exam.",
          ALL,
        ),
      ],
    }),
  ],
};
