import type { enOnboard } from "../en/onboard";

// 简体中文消息目录 —— 与 enOnboard 的 schema 完全一致。
export const zhOnboard: typeof enOnboard = {
  actions: {
    configureModels: "配置模型",
    getStarted: "开始使用",
    learnMore: "了解更多",
    manageInSettings: "在设置中管理",
    openModelSettings: "打开模型设置",
    closeOnboarding: "关闭引导",
  },
  analytics: {
    notice: "我们会收集匿名使用数据以改进应用。",
  },
  loading: {
    title: "正在检查本地服务商",
    hint: "正在查找这台计算机上已有的凭据。",
  },
  ready: {
    title: "可以开始运行",
    providerConfigured: "{providerName} 已为此工作区配置。",
    providerConfiguredFallback: "已为此工作区配置了一个服务商。",
  },
  detected: {
    titleOne: "已检测到服务商",
    titleOther: "已检测到多个服务商",
    hintOne: "从列表中添加一个已检测到的服务商以开始使用。",
    hintOther: "从列表中添加已检测到的服务商以开始使用。",
    detectedLocally: "本地检测到",
  },
  manual: {
    checkFailedTitle: "服务商检查失败",
    noProviderTitle: "未找到本地服务商",
    noProviderDescription: "在设置中添加一个服务商以选择模型。",
    recommendedSetup: "推荐设置",
    setUpInModelSettings: "在模型设置中配置",
  },
  errors: {
    discoveryMessage: "服务商检查未完成。请打开模型设置以继续。",
    addProviderMessage: "请打开模型设置后重试。",
  },
  toasts: {
    providerReady: "{providerName} 已就绪",
    couldNotAddProvider: "无法添加服务商",
  },
  aria: {
    heroImageAlt: "引导插图",
    addDetectedProvider: "添加已检测到的服务商 {providerName}",
    openModelSettingsToConfigure: "打开模型设置以配置 {providerName}",
  },
};
