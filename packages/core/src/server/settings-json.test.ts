import { mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, test } from "bun:test";

import { readJsonFileWithRecovery } from "./settings-json";

describe("readJsonFileWithRecovery", () => {
  test("backs up invalid JSON and rewrites defaults", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "llm-space-settings-"));
    const filePath = path.join(dir, "models.json");
    await writeFile(filePath, "{not json", "utf8");

    const result = await readJsonFileWithRecovery(filePath, { providers: [] });

    expect(result).toEqual({ providers: [] });
    expect(JSON.parse(await readFile(filePath, "utf8"))).toEqual({
      providers: [],
    });

    const files = await readdir(dir);
    const backup = files.find((file) => file.startsWith("models.json.invalid-"));
    expect(backup).toBeDefined();
    expect(await readFile(path.join(dir, backup!), "utf8")).toBe("{not json");
  });
});
