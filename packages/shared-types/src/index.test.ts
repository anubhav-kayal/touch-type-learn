import { describe, expect, it } from "vitest";
import { PACKAGE_NAME } from "./index";

describe("@keypath/shared-types", () => {
  it("exports the package name", () => {
    expect(PACKAGE_NAME).toBe("@keypath/shared-types");
  });
});
