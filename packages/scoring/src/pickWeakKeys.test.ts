import { describe, expect, it } from "vitest";
import { pickWeakKeys } from "./pickWeakKeys";

describe("pickWeakKeys", () => {
  const stats = [
    { key: "f", attempts: 12, mastery: 40 },
    { key: "j", attempts: 12, mastery: 22 },
    { key: "d", attempts: 20, mastery: 10 },
    { key: "e", attempts: 30, mastery: 5 },
    { key: "k", attempts: 8, mastery: 4 },
    { key: " ", attempts: 40, mastery: 1 },
  ];

  it("ignores locked letters and keys below the attempt floor", () => {
    const pick = pickWeakKeys(stats, ["f", "j", "d", "k"]);
    expect(pick.focus).toEqual(["d", "j", "f"]);
    expect(pick.focus).not.toContain("e");
    expect(pick.focus).not.toContain("k");
    expect(pick.focus).not.toContain(" ");
  });

  it("returns nothing until enough unlocked practice exists", () => {
    expect(pickWeakKeys(stats, ["a", "s"]).focus).toEqual([]);
  });
});
