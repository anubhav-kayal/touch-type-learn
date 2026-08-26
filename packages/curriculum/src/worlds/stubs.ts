import type { World, WorldId } from "../types";

function stub(
  id: WorldId,
  title: string,
  description: string,
  sortOrder: number,
): World {
  return {
    id,
    title,
    description,
    sortOrder,
    status: "stub",
    lessons: [],
  };
}

export const world6 = stub(
  "world-6",
  "Numbers and Symbols",
  "Number row, ₹, %, @, dates, and email.",
  6,
);

export const world7 = stub(
  "world-7",
  "Speed Training",
  "Speed targets from 20 WPM up, with accuracy still required.",
  7,
);

export const world8 = stub(
  "world-8",
  "Mastery",
  "Long form, prose, code, and endurance.",
  8,
);
