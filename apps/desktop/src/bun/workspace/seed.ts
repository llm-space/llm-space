import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { getLlmSpaceRoot } from "@llm-space/core/server";

import { EXAMPLE_THREAD } from "./example";

/**
 * On a fresh install `LLM_SPACE_HOME/workspace` does not exist yet. Create it and
 * seed a default `example.json` so the app opens with something to look at
 * instead of an empty tree. No-op once the workspace directory exists.
 */
export function seedWorkspace(): void {
  const workspace = path.join(getLlmSpaceRoot(), "workspace");
  if (existsSync(workspace)) {
    return;
  }
  mkdirSync(workspace, { recursive: true });
  writeFileSync(
    path.join(workspace, "example.json"),
    `${JSON.stringify(EXAMPLE_THREAD, null, 2)}\n`,
    "utf8"
  );
}

// Run on import so the workspace is seeded before storage/RPC touch it.
seedWorkspace();
