/**
 * Update UI (`update-dialog`, `update-indicator`, `update-status-provider`).
 *
 * English is the canonical schema; every other locale mirrors it exactly and is
 * type-checked against the type derived here. Reusable generic labels (Close,
 * Try again) live in `enCommon` and are referenced from the components via
 * `t.common.*` — only update-specific strings live here.
 *
 * Interpolated strings use `{version}` (the downloaded/release version).
 */
export const enUpdate = {
  /** Manual "Check for Updates" dialog (`update-dialog.tsx`). */
  dialog: {
    checkingTitle: "Checking for updates",
    checkingDescription: "Contacting the update server…",
    downloadingTitle: "Downloading update",
    downloadingDescription: "Getting version {version} ready to install…",
    continueInBackground: "Continue in background",
    upToDateTitle: "You're all set!",
    upToDateDescription: "You're already running the latest version — v{version}.",
    gotcha: "Gotcha",
    readyTitle: "Update ready",
    readyDescription:
      "Version {version} has been downloaded and is ready to install. Restarting takes just a moment.",
    later: "Later",
    restartNow: "Restart now",
    errorTitle: "Update check failed",
  },
  /** Toolbar badge + popover (`update-indicator.tsx`). */
  indicator: {
    tooltipLabel: "Update ready — restart to install",
    ariaLabel: "Update ready",
    readyLabel: "Update ready",
    downloadedHint: "v{version} has been downloaded. Restart to install.",
    restartNow: "Restart Now",
  },
  /** Passive toast cards + "updated" toast (`update-status-provider.tsx`). */
  status: {
    readyLabel: "Update ready",
    readyHint: "v{version} is ready to install.",
    restart: "Restart",
    dismissAriaLabel: "Dismiss",
    downloadingTitle: "Downloading update",
    downloadingHint: "v{version} — this continues in the background.",
    updatedToast: "Updated to v{version}",
    releaseNotesLabel: "Release notes",
  },
};
