import type { enCommon } from "../en/common";

/**
 * 简体中文 — common 区域。结构与 en 镜像，类型由 `enCommon` 推导保证一致。
 */
export const zhCommon: typeof enCommon = {
  cancel: "取消",
  done: "完成",
  save: "保存",
  close: "关闭",
  remove: "移除",
  delete: "删除",
  back: "返回",
  retry: "重试",
  loading: "加载中…",
  error: "错误",
  yes: "是",
  no: "否",
  os: {
    revealLabel: "在访达中显示",
    revealExplorer: "在资源管理器中显示",
    moveToTrashLabel: "移到废纸篓",
    moveToRecycleBinLabel: "移到回收站",
    trashName: "废纸篓",
    recycleBinName: "回收站",
  },
  toasts: {
    tryAgain: "请重试。",
    copied: "已复制",
    copyFailed: "复制失败",
  },
  firecrawlLimit: {
    title: "Firecrawl 今日额度已用完",
    description:
      "内置网页工具已达到 Firecrawl 免费未登录额度的每日上限。添加 Firecrawl API Key 后，可以提高额度并继续使用网页抓取和搜索。",
    cancel: "暂不设置",
    configure: "配置 API Key",
  },
  preview: {
    title: "预览",
    raw: "原文",
    markdown: "Markdown",
    html: "HTML",
    htmlPreviewTitle: "{title} HTML 预览",
  },
  codeEditor: {
    retry: "重试 CodeMirror 编辑器",
  },
};
