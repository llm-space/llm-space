import {
  ApplicationMenu,
  type ApplicationMenuItemConfig,
  type BrowserWindow,
} from "electrobun/bun";

import type { Command } from "../../shared/commands";
import type { Lang } from "../../shared/i18n";

import { getMenuLabels } from "./menu-labels";

/**
 * The app (first) submenu. Its update item is the one dynamic piece: normally
 * "Check for Updates…"; once an update is downloaded it becomes
 * "Restart to Update" (VS Code pattern). `setUpdateReadyInMenu` rebuilds the
 * whole menu — `setApplicationMenu` is idempotent and can be re-called anytime.
 *
 * Labels are localized; the menu rebuilds on a language change via
 * {@link setMenuLanguage}.
 */
function _appSubmenu(
  labels: ReturnType<typeof getMenuLabels>,
  updateReady: boolean
): ApplicationMenuItemConfig {
  const updateItem = updateReady
    ? { label: labels.app.restartToUpdate, action: "restartToUpdate" }
    : { label: labels.app.checkForUpdates, action: "checkForUpdates" };
  return {
    submenu: [
      { label: labels.app.about, role: "about" },
      updateItem,
      { type: "divider" },
      {
        label: labels.app.settings,
        action: "settings",
        accelerator: "CommandOrControl+,",
      },
      { type: "divider" },
      { role: "hide", accelerator: "CommandOrControl+H" },
      { role: "hideOthers", accelerator: "CommandOrControl+Shift+H" },
      { role: "showAll" },
      { type: "divider" },
      {
        label: labels.app.quit,
        role: "quit",
        accelerator: "CommandOrControl+Q",
      },
    ],
  };
}

function _buildMenu(
  lang: Lang,
  updateReady: boolean
): ApplicationMenuItemConfig[] {
  const labels = getMenuLabels(lang);
  return [
    _appSubmenu(labels, updateReady),
    {
      label: labels.file.title,
      submenu: [
        {
          label: labels.file.newFile,
          action: "newThread",
          accelerator: "CommandOrControl+N",
        },
        { label: labels.file.newFromExamples, action: "newFromExamples" },
        { type: "divider" },
        {
          label: labels.file.newFolder,
          action: "newFolder",
          accelerator: "CommandOrControl+Shift+N",
        },
        { type: "divider" },
        { label: labels.file.importFromFiles, action: "importFiles" },
        { label: labels.file.importFromClipboard, action: "importFromClipboard" },
        { type: "divider" },
        { label: labels.file.share, action: "shareThread" },
        { type: "divider" },
        { label: labels.file.refreshWorkspace, action: "refreshTree" },
        { label: labels.file.revealWorkspaceFolder, action: "revealWorkspaceFolder" },
        { type: "divider" },
        {
          label: labels.file.closeTab,
          action: "closeTab",
          accelerator: "CommandOrControl+W",
        },
        { label: labels.file.closeOthers, action: "closeOtherTabs" },
        { label: labels.file.closeAllTabs, action: "closeAllTabs" },
        { type: "divider" },
        {
          label: labels.file.reopenClosedTabs,
          action: "reopenClosedTabs",
          accelerator: "CommandOrControl+Shift+T",
        },
      ],
    },
    {
      label: labels.edit.title,
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "divider" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "pasteAndMatchStyle" },
        { role: "delete" },
        { role: "selectAll" },
      ],
    },
    {
      label: labels.view.title,
      submenu: [
        {
          label: labels.view.commandPalette,
          action: "commandPalette",
          accelerator: "CommandOrControl+Shift+P",
        },
        { type: "divider" },
        {
          label: labels.view.toggleSidebar,
          action: "toggleSidebar",
          accelerator: "CommandOrControl+B",
        },
        { type: "divider" },
        {
          label: labels.view.reload,
          action: "reload",
          accelerator: "CommandOrControl+Shift+R",
        },
        { type: "divider" },
        {
          label: labels.view.zoomIn,
          action: "zoomIn",
          accelerator: "CommandOrControl+Plus",
        },
        {
          label: labels.view.zoomOut,
          action: "zoomOut",
          accelerator: "CommandOrControl+-",
        },
        {
          label: labels.view.resetZoom,
          action: "resetZoom",
          accelerator: "CommandOrControl+0",
        },
      ],
    },
    {
      label: labels.window.title,
      role: "window",
      submenu: [
        { role: "minimize" },
        { role: "bringAllToFront" },
        { type: "divider" },
        {
          label: labels.window.selectPreviousTab,
          action: "selectPreviousTab",
          accelerator: "CommandOrControl+Option+Left",
        },
        {
          label: labels.window.selectNextTab,
          action: "selectNextTab",
          accelerator: "CommandOrControl+Option+Right",
        },
        { type: "divider" },
        { role: "toggleFullScreen", accelerator: "CommandOrControl+Shift+F" },
      ],
    },
    {
      label: labels.help.title,
      submenu: [
        { label: labels.help.viewDocumentation, action: "openDocument" },
        { type: "divider" },
        { label: labels.help.visitOfficialWebsite, action: "openOfficialWebsite" },
        { label: labels.help.visitGitHubProject, action: "openGitHubProject" },
        { label: labels.help.visitHarness101, action: "openHarness101" },
        { type: "divider" },
        { label: labels.help.reportBug, action: "reportBugs" },
        { label: labels.help.donate, action: "donate" },
        { type: "divider" },
        { label: labels.help.onboard, action: "onboard" },
      ],
    },
  ];
}

// Process-local menu state. The update-ready flag and the active language are
// the only things that change the menu's shape; both rebuild it via
// `setApplicationMenu`. Initialized when the menu is first registered.
let _menuState: { lang: Lang; updateReady: boolean } = {
  lang: "zh",
  updateReady: false,
};

function _rebuild(): void {
  ApplicationMenu.setApplicationMenu(
    _buildMenu(_menuState.lang, _menuState.updateReady)
  );
}

/**
 * Flip the app menu's update item between "Check for Updates…" and
 * "Restart to Update". Called by the updater service when a download becomes
 * ready. `null` restores the default item. Preserves the current language.
 */
export function setUpdateReadyInMenu(version: string | null) {
  _menuState = { ..._menuState, updateReady: version !== null };
  _rebuild();
}

/**
 * Switch the native menu's language and rebuild it. Called when the user
 * changes the language in Settings (the `setLanguage` RPC handler).
 */
export function setMenuLanguage(lang: Lang): void {
  _menuState = { ..._menuState, lang };
  _rebuild();
}

/** The current menu language (used by command handlers to pick locale URLs). */
export function getMenuLanguage(): Lang {
  return _menuState.lang;
}

/**
 * The native menu items carry a string `action`; map each to the {@link Command}
 * it dispatches. Everything then flows through the single `executeCommandInBun`
 * entry point (window-side commands run locally, webview-side ones are
 * forwarded over RPC).
 */
const MENU_ACTION_COMMANDS: Record<string, Command> = {
  reload: { type: "reload", args: {} },
  zoomIn: { type: "zoomIn", args: {} },
  zoomOut: { type: "zoomOut", args: {} },
  resetZoom: { type: "resetZoom", args: {} },
  toggleSidebar: { type: "toggleSidebar", args: {} },
  commandPalette: { type: "openCommandPalette", args: {} },
  settings: { type: "openSettings", args: {} },
  newThread: { type: "newFile", args: {} },
  newFromExamples: { type: "openStartFromExample", args: { parent: "" } },
  newFolder: { type: "newFolder", args: {} },
  importFiles: { type: "importFiles", args: {} },
  importFromClipboard: { type: "importFromClipboard", args: {} },
  shareThread: { type: "shareThread", args: {} },
  refreshTree: { type: "refreshTree", args: {} },
  revealWorkspaceFolder: { type: "openWorkspaceFolder", args: {} },
  closeTab: { type: "closeTab", args: {} },
  closeOtherTabs: { type: "closeOtherTabs", args: {} },
  closeAllTabs: { type: "closeAllTabs", args: {} },
  reopenClosedTabs: { type: "reopenClosedTab", args: {} },
  selectNextTab: { type: "selectNextTab", args: {} },
  selectPreviousTab: { type: "selectPreviousTab", args: {} },
  openDocument: { type: "openDocument", args: {} },
  openGitHubProject: {
    type: "openLink",
    args: { url: "https://github.com/deer-flow/llm-space/tree/main" },
  },
  openOfficialWebsite: {
    type: "openLink",
    args: { url: "https://deer-flow.github.io/llm-space/" },
  },
  reportBugs: { type: "reportBugs", args: {} },
  checkForUpdates: { type: "checkForUpdates", args: {} },
  restartToUpdate: { type: "applyUpdateAndRestart", args: {} },
  donate: {
    type: "openLink",
    args: { url: "https://my.feishu.cn/wiki/OvLBwVuSkiCR1ik5wGEcBXZfnye" },
  },
  onboard: { type: "openOnboard", args: {} },
  // Harness 101 links to a Chinese or English Feishu doc based on the active
  // menu language (the user's chosen UI language, not just the OS locale).
  // The entry here only tags the action; the URL is NOT baked into this map —
  // `MENU_ACTION_COMMANDS` is built once at module load, when `_menuState.lang`
  // is still the hardcoded default "zh", so freezing the URL here would forever
  // open the zh doc even in an English UI. The handler below resolves it at
  // click time via `getMenuLanguage()`, mirroring how `openDocument` resolves
  // the docs URL in commands.ts.
  openHarness101: { type: "openLink", args: { url: "" } },
};

/** Harness 101 URLs by language — resolved at click time, never at module load. */
const HARNESS_101_URL: Record<Lang, string> = {
  zh: "https://my.feishu.cn/wiki/L082wubkdie8uMkRUjgceKYQnIe?fromScene=spaceOverview",
  en: "https://my.feishu.cn/docx/G8CGdg2PQoGjsRxspKAc9XZYnKT",
};

/**
 * Install the application menu and wire its actions to the main window. Called
 * once after the window exists. `initialLang` seeds the menu's language (from
 * the {@link LanguageManager}); subsequent changes go through
 * {@link setMenuLanguage}.
 */
export function registerMenuActions(
  window: BrowserWindow,
  executeCommand: (command: Command, window: BrowserWindow) => void,
  initialLang: Lang
) {
  _menuState = { lang: initialLang, updateReady: false };
  _rebuild();
  ApplicationMenu.on("application-menu-clicked", (event) => {
    const { action } = (event as { data: { action: string } }).data;
    // Harness 101 must resolve its per-language URL at click time — the static
    // `MENU_ACTION_COMMANDS` entry can't carry it (see comment there).
    if (action === "openHarness101") {
      executeCommand(
        { type: "openLink", args: { url: HARNESS_101_URL[getMenuLanguage()] } },
        window
      );
      return;
    }
    const command = MENU_ACTION_COMMANDS[action];
    if (command) executeCommand(command, window);
  });
}
