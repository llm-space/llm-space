/**
 * Onboard dialog (`apps/desktop/src/components/onboard-dialog.tsx`). First-run
 * onboarding + reachable any time via the "Onboard..." command. English is the
 * canonical schema; zh mirrors it exactly.
 */
export const enOnboard = {
  actions: {
    configureModels: "Configure models",
    getStarted: "Get started",
    learnMore: "Learn more",
    manageInSettings: "Manage in settings",
    openModelSettings: "Open model settings",
    closeOnboarding: "Close onboarding",
  },
  analytics: {
    notice: "We collect anonymous usage data to improve the app.",
  },
  loading: {
    title: "Checking local providers",
    hint: "Looking for credentials already available on this computer.",
  },
  ready: {
    title: "Ready to run",
    providerConfigured: "{providerName} is configured for this workspace.",
    providerConfiguredFallback:
      "A provider is configured for this workspace.",
  },
  detected: {
    titleOne: "Provider detected",
    titleOther: "Providers detected",
    hintOne: "Add a detected provider from the list to get started.",
    hintOther: "Add detected providers from the list to get started.",
    detectedLocally: "Detected locally",
  },
  manual: {
    checkFailedTitle: "Provider check failed",
    noProviderTitle: "No local provider found",
    noProviderDescription: "Add a provider in settings to choose a model.",
    recommendedSetup: "Recommended setup",
    setUpInModelSettings: "Set up in model settings",
  },
  errors: {
    discoveryMessage:
      "Provider check did not finish. Open model settings to continue.",
    addProviderMessage: "Open model settings and try again.",
  },
  toasts: {
    providerReady: "{providerName} is ready",
    couldNotAddProvider: "Could not add provider",
  },
  aria: {
    heroImageAlt: "Onboarding illustration",
    addDetectedProvider: "Add detected provider {providerName}",
    openModelSettingsToConfigure:
      "Open model settings to configure {providerName}",
  },
};
