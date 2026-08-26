import { describe, expect, it } from "vitest";
import { PACKAGE_NAME } from "./index";

describe("@keypath/ui", () => {
  it("exports the package name", () => {
    expect(PACKAGE_NAME).toBe("@keypath/ui");
  });
});
