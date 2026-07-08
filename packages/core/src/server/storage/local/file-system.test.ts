import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, test } from "bun:test";

import { LocalFileSystem } from "./file-system";

describe("LocalFileSystem", () => {
  test("reports corrupt thread JSON with the thread path", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "llm-space-workspace-"));
    await writeFile(path.join(root, "broken.json"), "{bad json", "utf8");
    const fs = new LocalFileSystem(root);

    let error: unknown;
    try {
      await fs.read("broken.json");
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(
      'Thread file "broken.json" contains invalid JSON.'
    );
  });
});
