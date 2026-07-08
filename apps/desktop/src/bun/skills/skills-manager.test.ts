import { mkdir, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, test } from "bun:test";

describe("skillsManager", () => {
  test("recovers from a corrupt skills settings file", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "llm-space-skills-"));
    const settingsDir = path.join(root, "settings");
    await mkdir(settingsDir, { recursive: true });
    await writeFile(path.join(settingsDir, "skills.json"), "{bad json", "utf8");
    process.env.LLM_SPACE_ROOT = root;

    const { skillsManager } = await import("./skills-manager");

    expect(skillsManager.getConfig().discoveryPaths.length).toBeGreaterThan(0);
    expect(JSON.parse(await readFile(path.join(settingsDir, "skills.json"), "utf8"))).toEqual(
      skillsManager.getConfig()
    );

    const files = await readdir(settingsDir);
    expect(files.some((file) => file.startsWith("skills.json.invalid-"))).toBe(
      true
    );
  });
});
