import type { Lang } from "../../shared/i18n";

/**
 * Native-menu + command labels for the bun main process. The bun process can't
 * import `@llm-space/ui` (React-heavy), so this mirrors the `menu` /
 * `commandMeta` areas of the renderer catalog. The two stay in sync by
 * convention; menu labels are a small, stable set.
 *
 * `COMMAND_META` in `shared/commands.ts` carries the English label as its
 * fallback; this lookup supersedes it for the native menu and (via the
 * renderer's `t.commandMeta`) the command palette.
 */

interface MenuLabels {
  app: {
    about: string;
    checkForUpdates: string;
    restartToUpdate: string;
    settings: string;
    quit: string;
  };
  file: {
    title: string;
    newFile: string;
    newFromExamples: string;
    newFolder: string;
    importFromFiles: string;
    importFromClipboard: string;
    share: string;
    refreshWorkspace: string;
    revealWorkspaceFolder: string;
    closeTab: string;
    closeOthers: string;
    closeAllTabs: string;
    reopenClosedTabs: string;
  };
  edit: { title: string };
  view: {
    title: string;
    commandPalette: string;
    toggleSidebar: string;
    reload: string;
    zoomIn: string;
    zoomOut: string;
    resetZoom: string;
  };
  window: {
    title: string;
    selectPreviousTab: string;
    selectNextTab: string;
  };
  help: {
    title: string;
    viewDocumentation: string;
    visitOfficialWebsite: string;
    visitGitHubProject: string;
    visitHarness101: string;
    reportBug: string;
    donate: string;
    onboard: string;
  };
}

const EN: MenuLabels = {
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
  edit: { title: "Edit" },
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

const ZH: MenuLabels = {
  app: {
    about: "关于 LLM Space",
    checkForUpdates: "检查更新...",
    restartToUpdate: "重启以更新",
    settings: "设置...",
    quit: "退出 LLM Space",
  },
  file: {
    title: "文件",
    newFile: "新建文件",
    newFromExamples: "从示例新建...",
    newFolder: "新建文件夹",
    importFromFiles: "从文件导入...",
    importFromClipboard: "从剪贴板导入",
    share: "分享...",
    refreshWorkspace: "刷新工作区",
    revealWorkspaceFolder: "显示工作区文件夹",
    closeTab: "关闭标签页",
    closeOthers: "关闭其他",
    closeAllTabs: "关闭全部标签页",
    reopenClosedTabs: "重新打开已关闭标签页",
  },
  edit: { title: "编辑" },
  view: {
    title: "视图",
    commandPalette: "命令面板...",
    toggleSidebar: "切换侧边栏",
    reload: "重新加载",
    zoomIn: "放大",
    zoomOut: "缩小",
    resetZoom: "重置缩放",
  },
  window: {
    title: "窗口",
    selectPreviousTab: "选择上一个标签页",
    selectNextTab: "选择下一个标签页",
  },
  help: {
    title: "帮助",
    viewDocumentation: "查看文档",
    visitOfficialWebsite: "访问官方网站",
    visitGitHubProject: "访问 GitHub 项目",
    visitHarness101: "访问 Harness 101",
    reportBug: "报告问题",
    donate: "捐赠",
    onboard: "新手引导",
  },
};

const LABELS: Record<Lang, MenuLabels> = { en: EN, zh: ZH };

/** The native-menu labels for the active language. */
export function getMenuLabels(lang: Lang): MenuLabels {
  return LABELS[lang];
}
