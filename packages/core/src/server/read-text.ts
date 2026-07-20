import { readFile } from "node:fs/promises";
import path from "node:path";

import { expandHomePath } from "./paths";

/**
 * Read an arbitrary UTF-8 text file for the prompt `@include` macro. A leading
 * `~` expands to the user's home directory. Any failure — missing file, a
 * directory, permission denied — resolves to `""` so a broken include degrades
 * quietly and never leaks a path's existence through a distinct error message.
 *
 * This is intentionally NOT confined to the llm-space workspace (unlike the
 * `fs*` storage ops): `@include` is meant to pull in files from anywhere the
 * user can read (e.g. `~/notes/style.md`).
 */
export async function readUserTextFile(inputPath: string): Promise<string> {
  try {
    if (typeof inputPath !== "string" || inputPath.trim().length === 0) {
      return "";
    }
    const resolved = path.resolve(expandHomePath(inputPath));
    return await readFile(resolved, "utf8");
  } catch {
    return "";
  }
}
