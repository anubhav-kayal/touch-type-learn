import { defineLesson } from "../define";
import { typing } from "../generate";
import { HOME_ROW_KEYS } from "../types";
import type { World } from "../types";

const FJ = ["f", "j"];
const FJDK = ["f", "j", "d", "k"];
const FJDKS = ["f", "j", "d", "k", "s", "l"];
const HOME8 = ["a", "s", "d", "f", "j", "k", "l", ";"];
const HOME = [...HOME_ROW_KEYS];

export const world1: World = {
  id: "world-1",
  title: "Finger Foundations",
  description: "Home row, the F and J bumps, and your first words.",
  sortOrder: 1,
  status: "full",
  lessons: [
    defineLesson({
      id: "w1-orient",
      worldId: "world-1",
      title: "Find the bumps",
      description: "Index fingers rest on F and J.",
      newKeys: FJ,
      allowedKeys: FJ,
      assistance: "full",
      exercises: [
        {
          type: "introduction",
          title: "Home row starts on two bumps",
          body: "Curve both hands over the keyboard. Left index on F, right index on J. You should feel a small bump on each. Do not look down.",
        },
        typing("key-drill", "f j f j f j", FJ),
      ],
    }),
    defineLesson({
      id: "w1-home-fj",
      worldId: "world-1",
      title: "F and J",
      newKeys: FJ,
      allowedKeys: FJ,
      assistance: "full",
      exercises: [
        {
          type: "introduction",
          title: "Left index, right index",
          body: "F is left index. J is right index. Keep the other fingers hovering on the home row.",
        },
        typing("key-drill", "f f f j j j f j", FJ),
        typing("pattern", "f j j f f j", FJ),
        typing("challenge", "f j f j j f f j", FJ),
      ],
    }),
    defineLesson({
      id: "w1-home-dk",
      worldId: "world-1",
      title: "D and K",
      newKeys: ["d", "k"],
      allowedKeys: FJDK,
      assistance: "full",
      exercises: [
        {
          type: "introduction",
          title: "Middle fingers",
          body: "Left middle types D. Right middle types K. Return to F and J after each key.",
        },
        typing("key-drill", "d d k k d k", FJDK),
        typing("pattern", "d k k d f j d k", FJDK),
        typing("challenge", "d k f j d k j f", FJDK),
      ],
    }),
    defineLesson({
      id: "w1-home-sl",
      worldId: "world-1",
      title: "S and L",
      newKeys: ["s", "l"],
      allowedKeys: FJDKS,
      assistance: "full",
      exercises: [
        {
          type: "introduction",
          title: "Ring fingers",
          body: "Left ring types S. Right ring types L.",
        },
        typing("key-drill", "s s l l s l", FJDKS),
        typing("pattern", "s l d k s l f j", FJDKS),
        typing("challenge", "s l s d k l f j", FJDKS),
      ],
    }),
    defineLesson({
      id: "w1-home-a-semi",
      worldId: "world-1",
      title: "A and ;",
      newKeys: ["a", ";"],
      allowedKeys: HOME8,
      assistance: "full",
      exercises: [
        {
          type: "introduction",
          title: "Pinkies",
          body: "Left pinky types A. Right pinky types semicolon. They are weaker — stay accurate, not fast.",
        },
        typing("key-drill", "a a ; ; a ;", HOME8),
        typing("pattern", "a ; s l a ;", HOME8),
        typing("word", "as dad sad lad all", HOME8),
        typing("challenge", "as all dad sad a ;", HOME8),
      ],
    }),
    defineLesson({
      id: "w1-home-gh",
      worldId: "world-1",
      title: "G and H",
      newKeys: ["g", "h"],
      allowedKeys: HOME,
      assistance: "full",
      exercises: [
        {
          type: "introduction",
          title: "Index fingers reach inward",
          body: "Left index reaches to G. Right index reaches to H. Then return to the bumps.",
        },
        typing("key-drill", "g g h h g h", HOME),
        typing("pattern", "fg jh gf hj", HOME),
        typing("word", "had glad hall flags", HOME),
        typing("challenge", "had glad ash flags", HOME),
      ],
    }),
    defineLesson({
      id: "w1-home-combos",
      worldId: "world-1",
      title: "Home row mix",
      newKeys: [],
      allowedKeys: HOME,
      assistance: "full",
      exercises: [
        {
          type: "introduction",
          title: "Stay on the home row",
          body: "Every letter you know lives on this row. Keep your wrists quiet and bounce back to F and J.",
        },
        typing("pattern", "asdf jkl; asdf", HOME),
        typing("pattern", "fdsa ;lkj fdsa", HOME),
        typing("challenge", "asdf jkl; fjdk sla;", HOME),
      ],
    }),
    defineLesson({
      id: "w1-home-words",
      worldId: "world-1",
      title: "Home row words",
      newKeys: [],
      allowedKeys: HOME,
      assistance: "full",
      exercises: [
        {
          type: "introduction",
          title: "Real words, still home row",
          body: "These words use only keys you have learned. Accuracy still matters more than speed.",
        },
        typing("word", "as ask fall flask", HOME),
        typing("word", "salad glad flags dash", HOME),
        typing("challenge", "ask a sad lad fall", HOME),
      ],
    }),
    defineLesson({
      id: "w1-home-boss",
      worldId: "world-1",
      title: "Home row mastery",
      description: "Boss lesson. Pass with 90% accuracy to leave World 1.",
      newKeys: [],
      allowedKeys: HOME,
      assistance: "full",
      isBoss: true,
      exercises: [
        {
          type: "introduction",
          title: "Home row boss",
          body: "A longer mix of letters and words. No new keys. Breathe, hit the bumps, and stay accurate.",
        },
        typing("boss", "asdf jkl; fall flask salad glad had dash ask all", HOME),
      ],
    }),
  ],
};
