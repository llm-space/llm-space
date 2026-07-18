import type { enTabs } from "../en/tabs";

// 简体中文镜像——结构与 enTabs 完全一致（由 typeof enTabs 强制）。
// OS 相关标签（废纸篓/回收站、访达/资源管理器）不在本文件内，统一在
// `t.common.os` 中按平台取用。通用的“错误” toast 标题复用 `t.common.error`。
export const zhTabs: typeof enTabs = {
  strings: {},
  welcome: {
    title: "欢迎使用 LLM Space 4",
    description:
      "从一个现成的 Agent 会话开始，创建一个空白会话，或从左侧边栏打开已有文件。",
    startFromExamples: "从示例开始",
    blankThread: "空白会话",
    configureModels: "配置模型",
    learnMore: "了解更多",
  },
  startExample: {
    title: "从示例开始",
    description: "选择一个提示词示例来创建新会话。",
  },
  page: {
    sidebarFiles: "文件",
    sidebarTraces: "追踪",
    tracesBetaBadge: "测试版",
    dropFilesHint: "拖放文件以导入为会话",
    importThreadFilesAria: "导入会话文件",
    importNone: "无法从所选文件导入任何会话。",
    importSuccessOne: "已导入 {count} 个会话",
    importSuccessOther: "已导入 {count} 个会话",
    filesSkippedOne: "已跳过 {count} 个文件",
    filesSkippedOther: "已跳过 {count} 个文件",
  },
  tabsBar: {
    hideSidebar: "隐藏侧边栏",
    showSidebar: "显示侧边栏",
    newBlankThread: "新建空白会话",
    openLabel: "打开 {label}",
    closeLabel: "关闭 {label}",
    refresh: "刷新",
    close: "关闭",
    closeOthers: "关闭其他",
    closeAll: "全部关闭",
    share: "分享...",
  },
  pane: {
    fileNotFound: "找不到文件：{path}",
    failedToRefresh: "刷新失败",
  },
  trace: {
    traceIdCopied: "已复制 Trace ID",
    couldNotCopyTraceId: "无法复制 Trace ID",
    langfuse: "Langfuse",
    copyTraceIdTitle: "复制 Trace ID",
    copyTraceIdAria: "复制 Trace ID",
    traceWorkbenchNotFound: "找不到 Trace 工作台",
    failedToRefreshTrace: "刷新 Trace 失败",
    traceTitleRequired: "请填写 Trace 标题。",
    traceTitleControlChar: "Trace 标题包含控制字符。",
  },
};
