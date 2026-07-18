import type { enMenu } from "../en/menu";

export const zhMenu: typeof enMenu = {
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
  edit: {
    title: "编辑",
  },
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
