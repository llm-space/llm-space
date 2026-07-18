import type { enFileTree } from "../en/file-tree";

/**
 * 简体中文 — file tree 区域。结构与 en 镜像，类型由 `enFileTree` 推导保证一致。
 * OS 相关标签（废纸篓/回收站、访达/资源管理器）不在本文件内，统一在
 * `t.common.os` 中按平台取用。
 */
export const zhFileTree: typeof enFileTree = {
  nodeActions: {
    newFromExamplesIn: "在 {name} 中从示例新建",
    newFolderIn: "在 {name} 中新建文件夹",
    moreActionsFor: "{name} 的更多操作",
    share: "分享...",
    importFromFiles: "从文件导入...",
    importFromClipboard: "从剪贴板导入",
    copy: "复制",
    duplicate: "创建副本",
    rename: "重命名",
  },
  rootActions: {
    newFromExamples: "从示例新建",
    newFolderInRoot: "在工作区根目录新建文件夹",
    settings: "设置",
    moreActionsForRoot: "工作区根目录的更多操作",
    refresh: "刷新",
  },
  tree: {
    brand: "LLM Space 4",
    emptyTitle: "暂无会话",
    emptyDescription: "创建一个会话以开始。",
  },
  confirmDelete: {
    title: "将“{name}”移到{trash}？",
    description: "稍后可从{trash}中恢复。",
    confirmLabel: "移到{trash}",
  },
  confirmReplace: {
    title: "替换“{name}”？",
    folderDescription:
      "此处已存在同名文件夹。替换会将现有文件夹移到{trash}。",
    threadDescription:
      "此处已存在同名会话。替换会将现有会话移到{trash}。",
    confirmLabel: "替换",
  },
  toasts: {
    cannotMoveIntoItself: "无法将文件夹移入其自身。",
  },
};
