import { WORLD_IDS } from "@keypath/curriculum";
import { STAR_ACCURACY } from "@keypath/scoring";
import { PACKAGE_NAME as engineName } from "@keypath/typing-engine";
import { expect, test } from "vitest";

test("workspace packages resolve from the web app", () => {
  expect(engineName).toBe("@keypath/typing-engine");
  expect(WORLD_IDS).toHaveLength(8);
  expect(STAR_ACCURACY.one).toBe(0.9);
});
