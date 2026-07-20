import os from "node:os";
import path from "node:path";

/** Root directory for llm-space user data (`settings/`, `workspace/`, etc.). */
export function getLlmSpaceHomePath(): string {
  return (
    process.env.LLM_SPACE_HOME ?? path.join(os.homedir(), ".llm-space")
  );
}

/** Directory holding persisted settings (`window.json`, etc.). */
export function getSettingsDir(): string {
  return path.join(getLlmSpaceHomePath(), "settings");
}

export function getWindowStatePath(): string {
  return path.join(getSettingsDir(), "window.json");
}

/**
 * Expand a leading `~` / `~/` to the user's home directory. Only a leading
 * tilde is expanded (a `~user` form or a mid-path `~` is left untouched).
 */
export function expandHomePath(p: string): string {
  if (p === "~") {
    return os.homedir();
  }
  if (p.startsWith("~/") || p.startsWith("~\\")) {
    return path.join(os.homedir(), p.slice(2));
  }
  return p;
}
