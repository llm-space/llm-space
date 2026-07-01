import { stat } from "node:fs/promises";
import path from "node:path";

/**
 * Reveal an absolute path in the OS file manager, selecting the entry within
 * its containing folder where the platform supports it:
 *
 * - macOS — `open -R <path>` (Finder, with the item selected).
 * - Windows — `explorer /select,<path>` (Explorer, with the item selected).
 * - Linux — no portable "select" exists, so open the containing directory
 *   (or the directory itself) via `xdg-open`.
 *
 * Fire-and-forget: the child is detached so it never blocks. `Bun.spawn`
 * throws synchronously if the binary can't be launched, surfacing as a
 * rejected promise the caller can report.
 */
export async function revealInFileManager(abs: string): Promise<void> {
  const cmd = await _revealCommand(abs);
  Bun.spawn(cmd, { stdin: "ignore", stdout: "ignore", stderr: "ignore" }).unref();
}

async function _revealCommand(abs: string): Promise<string[]> {
  if (process.platform === "darwin") {
    return ["open", "-R", abs];
  }
  if (process.platform === "win32") {
    // `/select,<path>` must be a single argument; explorer also exits non-zero
    // on success, so we don't inspect its exit code.
    return ["explorer.exe", `/select,${abs}`];
  }
  // Linux/other: open the enclosing folder (or the folder itself).
  const dir = (await stat(abs)).isDirectory() ? abs : path.dirname(abs);
  return ["xdg-open", dir];
}
