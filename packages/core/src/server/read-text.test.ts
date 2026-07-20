import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, describe, expect, test } from "bun:test";

import { expandHomePath } from "./paths";
import { readUserTextFile } from "./read-text";

const tmp = mkdtempSync(path.join(os.tmpdir(), "llm-space-readtext-"));

afterAll(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe("expandHomePath", () => {
  test("expands a leading ~", () => {
    expect(expandHomePath("~")).toBe(os.homedir());
    expect(expandHomePath("~/notes/x.md")).toBe(
      path.join(os.homedir(), "notes/x.md")
    );
  });

  test("leaves absolute and mid-path tildes untouched", () => {
    expect(expandHomePath("/abs/path.md")).toBe("/abs/path.md");
    expect(expandHomePath("./a/~b")).toBe("./a/~b");
    expect(expandHomePath("~user/x")).toBe("~user/x");
  });
});

describe("readUserTextFile", () => {
  test("reads an existing file", async () => {
    const file = path.join(tmp, "note.md");
    writeFileSync(file, "hello world", "utf8");
    expect(await readUserTextFile(file)).toBe("hello world");
  });

  test("returns '' for a missing file", async () => {
    expect(await readUserTextFile(path.join(tmp, "nope.md"))).toBe("");
  });

  test("returns '' for a directory or empty input", async () => {
    expect(await readUserTextFile(tmp)).toBe("");
    expect(await readUserTextFile("")).toBe("");
  });
});
