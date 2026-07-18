import type { enGithub } from "../en/github";

// 简体中文 — 镜像 enGithub 的 schema，由 typeof enGithub 强制校验。
export const zhGithub: typeof enGithub = {
  account: {
    // 未登录状态：登录按钮及其提示。
    signInTooltip: "登录以通过 GitHub Gist 在网页上分享你的会话。",
    signIn: "登录 GitHub",
    // 登录中状态。
    signingIn: "登录中…",
    cancelSignIn: "取消登录",
    // 已登录下拉菜单。
    openProfile: "打开 GitHub 主页",
    signOut: "退出登录",
  },
  deviceDialog: {
    title: "使用 GitHub 登录",
    description:
      "复制此验证码，然后在我们打开的 GitHub 页面上完成授权。将验证码粘贴到该页面并确认。",
    copyCode: "复制验证码",
    requestingCode: "正在向 GitHub 请求验证码…",
    waitingForAuth: "等待你在 GitHub 上完成授权…",
    cancel: "取消",
    openAgain: "再次打开 GitHub",
    copyAndOpen: "复制验证码并打开 GitHub",
  },
  starReminder: {
    starOnGithub: "在 GitHub 上为 LLM Space 点赞",
    dismiss: "关闭",
  },
};
