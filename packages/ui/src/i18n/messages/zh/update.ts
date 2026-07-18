import type { enUpdate } from "../en/update";

// 简体中文 — update 区域。结构与 en 镜像，类型由 `enUpdate` 推导保证一致。
export const zhUpdate: typeof enUpdate = {
  /** 手动"检查更新"对话框（`update-dialog.tsx`）。 */
  dialog: {
    checkingTitle: "正在检查更新",
    checkingDescription: "正在联系更新服务器…",
    downloadingTitle: "正在下载更新",
    downloadingDescription: "正在准备 {version} 版本以供安装…",
    continueInBackground: "转到后台继续",
    upToDateTitle: "已是最新版本！",
    upToDateDescription: "你已经在使用最新版本 — v{version}。",
    gotcha: "好的",
    readyTitle: "更新已就绪",
    readyDescription:
      "{version} 版本已下载完成，可以安装。重启只需片刻。",
    later: "稍后",
    restartNow: "立即重启",
    errorTitle: "更新检查失败",
  },
  /** 工具栏徽标 + 弹出层（`update-indicator.tsx`）。 */
  indicator: {
    tooltipLabel: "更新已就绪 — 重启以安装",
    ariaLabel: "更新已就绪",
    readyLabel: "更新已就绪",
    downloadedHint: "v{version} 已下载。重启以安装。",
    restartNow: "立即重启",
  },
  /** 被动提示卡片 + "已更新"提示（`update-status-provider.tsx`）。 */
  status: {
    readyLabel: "更新已就绪",
    readyHint: "v{version} 已就绪，可以安装。",
    restart: "重启",
    dismissAriaLabel: "关闭",
    downloadingTitle: "正在下载更新",
    downloadingHint: "v{version} — 将在后台继续进行。",
    updatedToast: "已更新到 v{version}",
    releaseNotesLabel: "更新日志",
  },
};
