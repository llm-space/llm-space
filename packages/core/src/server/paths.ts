import os from "node:os";
import path from "node:path";

/** Root directory for llm-space user data (`settings/`, `workspace/`, etc.). */
export function getLlmSpaceRoot(): string {
  return (
    process.env.LLM_SPACE_ROOT ??
    process.env.LLM_SPACE_HOME ??
    path.join(os.homedir(), ".llm-space")
  );
}

/** Directory holding persisted settings (`window.json`, etc.). */
export function getSettingsDir(): string {
  return path.join(getLlmSpaceRoot(), "settings");
}

export function getWindowStatePath(): string {
  return path.join(getSettingsDir(), "window.json");
}
