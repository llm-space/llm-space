import { mkdir, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, test } from "bun:test";

describe("mcpManager", () => {
  test("recovers from a corrupt MCP settings file", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "llm-space-mcp-"));
    const settingsDir = path.join(root, "settings");
    await mkdir(settingsDir, { recursive: true });
    await writeFile(path.join(settingsDir, "mcp.json"), "{bad json", "utf8");
    process.env.LLM_SPACE_ROOT = root;

    const { mcpManager } = await import("./mcp-manager");

    expect(mcpManager.listServers()).toEqual([]);
    expect(
      JSON.parse(await readFile(path.join(settingsDir, "mcp.json"), "utf8"))
    ).toEqual({ servers: [] });

    const files = await readdir(settingsDir);
    expect(files.some((file) => file.startsWith("mcp.json.invalid-"))).toBe(
      true
    );
  });
});
