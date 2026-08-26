import { describe, expect, it } from "vitest";
import { KEYBOARD_LAYOUT, PACKAGE_NAME } from "./index";

describe("@keypath/typing-engine", () => {
  it("exports the package name and layout", () => {
    expect(PACKAGE_NAME).toBe("@keypath/typing-engine");
    expect(KEYBOARD_LAYOUT).toBe("us-qwerty");
  });
});
