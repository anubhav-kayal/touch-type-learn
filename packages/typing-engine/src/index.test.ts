import { describe, expect, it } from "vitest";
import { PACKAGE_NAME, createTypingSessionPlaceholder } from "./index";

describe("@keypath/typing-engine", () => {
  it("exports the package name", () => {
    expect(PACKAGE_NAME).toBe("@keypath/typing-engine");
  });

  it("returns an uninitialized session placeholder", () => {
    expect(createTypingSessionPlaceholder()).toEqual({ status: "uninitialized" });
  });
});
