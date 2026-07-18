/**
 * Labels for every {@link Command} `type` — Title Case, shown in the command
 * palette and mirrored by the native menu. These mirror `COMMAND_META.label`
 * in `apps/desktop/src/shared/commands.ts`; the i18n lookup supersedes the
 * hardcoded English there.
 *
 * OS-conditional labels (`revealFile`, `deleteFile`) carry both forms; the
 * caller resolves the right one via `t.common.os` based on the platform.
 */
export const enCommandMeta = {
  newFile: "New File",
  newFileFromPromptExample: "Start from Example",
  openStartFromExample: "New from Examples...",
  newFolder: "New Folder",
  renameFile: "Rename",
  duplicateFile: "Duplicate",
  deleteFile: "Move to Trash",
  revealFile: "Reveal in Finder",
  copyFile: "Copy",
  refreshTree: "Refresh",
  revealInTree: "Reveal in Tree",
  importFiles: "Import from Files...",
  importFromClipboard: "Import from Clipboard",
  createTraceProject: "New Trace Project",
  createConnectedTraceProject: "Connect Langfuse",
  importLangfuseTraceFiles: "Import Langfuse Export...",
  syncLangfuseTraceIds: "Sync Langfuse Traces",
  closeTab: "Close Tab",
  closeOtherTabs: "Close Other Tabs",
  closeAllTabs: "Close All Tabs",
  reopenClosedTab: "Reopen Closed Tab",
  selectNextTab: "Select Next Tab",
  selectPreviousTab: "Select Previous Tab",
  toggleSidebar: "Toggle Sidebar",
  openSettings: "Settings",
  openModelSettings: "Configure Model Settings",
  openCommandPalette: "Command Palette",
  openOnboard: "Onboard...",
  runThread: "Run Thread",
  shareThread: "Share...",
  openVariables: "Variables",
  zoomIn: "Zoom In",
  zoomOut: "Zoom Out",
  resetZoom: "Reset Zoom",
  reload: "Reload",
  openLink: "Open Link",
  openDocument: "Documents",
  reportBugs: "Report Bug",
  openWorkspaceFolder: "Open Workspace Folder",
  githubLogin: "Sign in with GitHub",
  githubLogout: "Sign out of GitHub",
  checkForUpdates: "Check for Updates...",
  applyUpdateAndRestart: "Restart to Update",
};
