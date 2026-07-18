import type { enViewer } from "../en/viewer";

export const zhViewer: typeof enViewer = {
  loading: {
    loadingSharedThread: "正在加载分享的对话…",
    failedToLoad: "加载失败。",
  },
  actions: {
    openInLlmSpace: "在 LLM Space 中打开",
  },
  fullscreen: {
    enterFullScreen: "全屏",
    exitFullScreen: "退出全屏",
    exitFullScreenAria: "退出全屏",
    enterFullScreenAria: "进入全屏",
  },
  meta: {
    sharedThread: "分享的对话",
    untitledThread: "未命名对话",
    lastUpdated: "最后更新于 {date}",
    created: "创建于 {date}",
    sharedBy: "分享者：{author}",
  },
  notFound: {
    eyebrow: "未找到",
    title: "无法打开这个分享的对话",
    description: "链接可能已失效、不公开，或对话已不存在。",
    backToLlmSpace: "返回 LLM Space",
  },
};
