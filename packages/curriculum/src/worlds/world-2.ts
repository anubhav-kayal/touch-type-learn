import { defineLesson } from "../define";
import { typing } from "../generate";
import { HOME_ROW_KEYS } from "../types";
import type { World } from "../types";

const HOME = [...HOME_ROW_KEYS];
const EI = [...HOME, "e", "i"];
const RU = [...EI, "r", "u"];
const TY = [...RU, "t", "y"];
const WO = [...TY, "w", "o"];
const QP = [...WO, "q", "p"];

export const world2: World = {
  id: "world-2",
  title: "Top Row",
  description: "Reach up from the home row, one pair at a time.",
  sortOrder: 2,
  status: "full",
  lessons: [
    defineLesson({
      id: "w2-ei",
      worldId: "world-2",
      title: "E and I",
      newKeys: ["e", "i"],
      allowedKeys: EI,
      assistance: "full",
      exercises: [
        {
          type: "introduction",
          title: "Middle fingers reach up",
          body: "Left middle types E (above D). Right middle types I (above K). Return home after each reach.",
        },
        typing("key-drill", "e e i i e i", EI),
        typing("pattern", "de ki ed ik e i", EI),
        typing("word", "if did see desk file", EI),
        typing("challenge", "if she said a desk", EI),
      ],
    }),
    defineLesson({
      id: "w2-ru",
      worldId: "world-2",
      title: "R and U",
      newKeys: ["r", "u"],
      allowedKeys: RU,
      assistance: "full",
      exercises: [
        {
          type: "introduction",
          title: "Index fingers reach up",
          body: "Left index types R (above F). Right index types U (above J).",
        },
        typing("key-drill", "r r u u r u", RU),
        typing("pattern", "fr ju rf uj r u", RU),
        typing("word", "far jar use sure fire", RU),
        typing("challenge", "sure fire is real", RU),
      ],
    }),
    defineLesson({
      id: "w2-ty",
      worldId: "world-2",
      title: "T and Y",
      newKeys: ["t", "y"],
      allowedKeys: TY,
      assistance: "full",
      exercises: [
        {
          type: "introduction",
          title: "Index fingers stretch inward",
          body: "Left index types T. Right index types Y. These reaches are easy to overshoot — stay accurate.",
        },
        typing("key-drill", "t t y y t y", TY),
        typing("pattern", "ft jy tf yj t y", TY),
        typing("word", "the yet stay just try", TY),
        typing("challenge", "they just try the keys", TY),
      ],
    }),
    defineLesson({
      id: "w2-wo",
      worldId: "world-2",
      title: "W and O",
      newKeys: ["w", "o"],
      allowedKeys: WO,
      assistance: "minimal",
      exercises: [
        {
          type: "introduction",
          title: "Ring fingers reach up",
          body: "Left ring types W (above S). Right ring types O (above L). Visual help starts to fade.",
        },
        typing("key-drill", "w w o o w o", WO),
        typing("pattern", "sw lo ws ol w o", WO),
        typing("word", "we so word work two", WO),
        typing("challenge", "we work so slow too", WO),
      ],
    }),
    defineLesson({
      id: "w2-qp",
      worldId: "world-2",
      title: "Q and P",
      newKeys: ["q", "p"],
      allowedKeys: QP,
      assistance: "minimal",
      exercises: [
        {
          type: "introduction",
          title: "Pinkies reach up",
          body: "Left pinky types Q (above A). Right pinky types P (above semicolon). Keep accuracy high.",
        },
        typing("key-drill", "q q p p q p", QP),
        typing("pattern", "aq ;p qa p; q p", QP),
        typing("word", "up put quit type paid", QP),
        typing("challenge", "please type a quiet word", QP),
      ],
    }),
    defineLesson({
      id: "w2-boss",
      worldId: "world-2",
      title: "Top row mastery",
      newKeys: [],
      allowedKeys: QP,
      assistance: "minimal",
      isBoss: true,
      exercises: [
        {
          type: "introduction",
          title: "Top row boss",
          body: "Home row plus the full top row. No bottom-row keys yet.",
        },
        typing(
          "boss",
          "we are ready you should type a quiet day the yellow kite please wait",
          QP,
        ),
      ],
    }),
  ],
};
