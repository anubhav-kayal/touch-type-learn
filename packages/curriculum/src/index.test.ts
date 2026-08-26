import { describe, expect, it } from "vitest";
import { PACKAGE_NAME, WORLD_IDS } from "./index";

describe("@keypath/curriculum", () => {
  it("exports the package name", () => {
    expect(PACKAGE_NAME).toBe("@keypath/curriculum");
  });

  it("defines eight worlds", () => {
    expect(WORLD_IDS).toHaveLength(8);
  });
});
