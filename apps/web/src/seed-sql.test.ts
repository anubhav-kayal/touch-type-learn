import { renderCurriculumSeedSql } from "@keypath/curriculum";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

test("supabase seed.sql matches the curriculum catalog", () => {
  const sql = readFileSync(join(__dirname, "../../../supabase/seed.sql"), "utf8");
  expect(sql).toBe(renderCurriculumSeedSql());
});
