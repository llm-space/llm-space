/**
 * GitHub auth UI strings:
 * - `account-status.tsx` — sidebar account widget (sign in / signing in / signed in).
 * - `github-device-dialog.tsx` — the Device Flow pairing dialog.
 * - `github-star-reminder.tsx` — the passive "star us" card.
 *
 * English is the canonical schema; every other locale mirrors it exactly and is
 * type-checked against the {@link enGithub} type. POPULATED BY THE i18n MIGRATION WORKFLOW.
 */
export const enGithub = {
  account: {
    // Signed-out state: the sign-in button + its tooltip.
    signInTooltip: "Sign in to share your threads on the web via GitHub Gist.",
    signIn: "Sign in to GitHub",
    // Signing-in state.
    signingIn: "Signing in…",
    cancelSignIn: "Cancel sign-in",
    // Signed-in dropdown.
    openProfile: "Open GitHub Profile",
    signOut: "Sign out",
  },
  deviceDialog: {
    title: "Sign in with GitHub",
    description:
      "Copy this code, then authorize on the GitHub page we open. Paste the code there and confirm.",
    copyCode: "Copy code",
    requestingCode: "Requesting a code from GitHub…",
    waitingForAuth: "Waiting for you to authorize on GitHub…",
    cancel: "Cancel",
    openAgain: "Open GitHub again",
    copyAndOpen: "Copy code & open GitHub",
  },
  starReminder: {
    starOnGithub: "Star LLM Space on GitHub",
    dismiss: "Dismiss",
  },
};
