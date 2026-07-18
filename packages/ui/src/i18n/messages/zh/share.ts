import type { enShare } from "../en/share";

// Mirrors enShare exactly — the `typeof enShare` annotation enforces key parity.
export const zhShare: typeof enShare = {
  /** Dialog header. */
  title: "分享对话",
  description: "将此对话发布为链接，任何人都可以在浏览器中打开。",
  /** Amber warning callout. */
  warning:
    "任何拥有链接的人都可以查看完整对话——包括提示词、消息和工具调用。它将以你的身份发布为私密 GitHub Gist；删除该 gist 即可撤销访问。",
  /** Success state. */
  shareLinkLabel: "分享链接",
  copy: "复制",
  openInBrowser: "在浏览器中打开",
  /** Form state. */
  shareVia: "分享方式",
  githubGist: "GitHub Gist",
  titleLabel: "标题",
  titlePlaceholder: "未命名对话",
  descriptionLabel: "描述",
  descriptionOptional: "（可选）",
  descriptionPlaceholder: "这个对话是关于什么的？",
  /** Primary action button, by status. */
  waitingForSignIn: "正在等待 GitHub 登录…",
  creatingLink: "正在创建链接…",
  generateLink: "生成链接",
  /** Confirm-before-sign-in dialog. */
  signInTitle: "登录 GitHub？",
  signInDescription:
    "分享会将此对话发布为私密 GitHub Gist，因此你需要先登录 GitHub。是否继续？",
  signInConfirm: "登录并继续",
  /** Friendly error messages. */
  errorSignInRequired: "分享前需要登录 GitHub。请登录后重试。",
  errorRateLimit: "已达到 GitHub 速率限制。请稍候片刻后重试。",
  errorGeneric: "无法创建分享链接。请重试。",
  importDialogTitle: "正在导入分享对话",
  importDialogDescription: "正在获取并保存到你的工作区…",
  importedTitle: "已导入“{title}”",
  importedFallback: "对话已导入",
};
