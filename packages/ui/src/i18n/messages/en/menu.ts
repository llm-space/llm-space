/**
 * Native application menu labels (bun main process). These are the Title Case
 * labels rendered by the OS menu bar, sourced from `apps/desktop/src/bun/app/menu.ts`.
 * `app`, `file`, `edit`, `view`, `window`, `help` are the top-level menus; the
 * OS-localized role items (undo/redo/cut/copy/paste, hide, minimize, …) are not
 * included — those come from the OS.
 */
export const enMenu = {
  app: {
    about: "About LLM Space",
    checkForUpdates: "Check for Updates...",
    restartToUpdate: "Restart to Update",
    settings: "Settings...",
    quit: "Quit LLM Space",
  },
  file: {
    title: "File",
    newFile: "New File",
    newFromExamples: "New from Examples...",
    newFolder: "New Folder",
    importFromFiles: "Import from Files...",
    importFromClipboard: "Import from Clipboard",
    share: "Share...",
    refreshWorkspace: "Refresh Workspace",
    revealWorkspaceFolder: "Reveal Workspace Folder",
    closeTab: "Close Tab",
    closeOthers: "Close Others",
    closeAllTabs: "Close All Tabs",
    reopenClosedTabs: "Reopen Closed Tabs",
  },
  edit: {
    title: "Edit",
  },
  view: {
    title: "View",
    commandPalette: "Command Palette...",
    toggleSidebar: "Toggle Sidebar",
    reload: "Reload",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    resetZoom: "Reset Zoom",
  },
  window: {
    title: "Window",
    selectPreviousTab: "Select Previous Tab",
    selectNextTab: "Select Next Tab",
  },
  help: {
    title: "Help",
    viewDocumentation: "View Documentation",
    visitOfficialWebsite: "Visit Official Website",
    visitGitHubProject: "Visit GitHub Project",
    visitHarness101: "Visit Harness 101",
    reportBug: "Report Bug",
    donate: "Donate",
    onboard: "Onboard",
  },
};
