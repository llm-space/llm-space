/**
 * Keeps the Windows Add/Remove Programs entry truthful across self-updates.
 *
 * The NSIS installer (apps/desktop/installer/llm-space.nsi) writes
 * DisplayVersion once at install time, but electrobun's updater swaps the app
 * folder without going through the installer, so the registry value would
 * drift behind the running version forever. Refresh it on startup instead.
 *
 * Best-effort and win32-only: only touches an entry the installer already
 * created (a zip/manual install has no entry, and creating one here would
 * surface a half-filled ARP row with no uninstaller).
 */

const REG_EXE = "reg.exe";

function _uninstallKey(channel: string): string {
  return `HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\LLMSpace-${channel}`;
}

export function refreshWindowsUninstallEntry(
  channel: string,
  version: string
): void {
  if (process.platform !== "win32") return;
  try {
    const key = _uninstallKey(channel);
    const query = Bun.spawnSync([REG_EXE, "query", key, "/v", "DisplayVersion"]);
    if (query.exitCode !== 0) return;
    Bun.spawnSync([
      REG_EXE,
      "add",
      key,
      "/v",
      "DisplayVersion",
      "/t",
      "REG_SZ",
      "/d",
      version,
      "/f",
    ]);
  } catch {
    // Cosmetic metadata — never let registry hiccups affect startup.
  }
}
