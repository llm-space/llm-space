/**
 * Share thread dialog (`apps/desktop/src/components/share-thread-dialog.tsx`).
 *
 * English is the canonical schema; every other locale mirrors it exactly and is
 * type-checked against the type derived here. Reusable generic labels (Cancel,
 * Done, Try again, Copied) live in `enCommon` and are referenced from the
 * component via `t.common.*` — only share-specific strings live here.
 */
export const enShare = {
  /** Dialog header. */
  title: "Share thread",
  description: "Publish this thread to a link anyone can open in their browser.",
  /** Amber warning callout. */
  warning:
    "Anyone with the link can view the full thread — its prompts, messages, and tool calls. It's published as a secret GitHub Gist under your account; delete the gist to revoke access.",
  /** Success state. */
  shareLinkLabel: "Share link",
  copy: "Copy",
  openInBrowser: "Open in browser",
  /** Form state. */
  shareVia: "Share via",
  githubGist: "GitHub Gist",
  titleLabel: "Title",
  titlePlaceholder: "Untitled thread",
  descriptionLabel: "Description",
  descriptionOptional: "(optional)",
  descriptionPlaceholder: "What is this thread about?",
  /** Primary action button, by status. */
  waitingForSignIn: "Waiting for GitHub sign-in…",
  creatingLink: "Creating link…",
  generateLink: "Generate link",
  /** Confirm-before-sign-in dialog. */
  signInTitle: "Sign in to GitHub?",
  signInDescription:
    "Sharing publishes this thread as a secret GitHub Gist, so you need to sign in to GitHub first. Continue?",
  signInConfirm: "Sign in and continue",
  /** Friendly error messages. */
  errorSignInRequired:
    "GitHub sign-in is required to share. Please sign in and try again.",
  errorRateLimit:
    "GitHub rate limit reached. Please wait a moment and try again.",
  errorGeneric: "Couldn't create the share link. Please try again.",
  importDialogTitle: "Importing shared thread",
  importDialogDescription: "Fetching and saving it to your workspace…",
  importedTitle: 'Imported "{title}"',
  importedFallback: "Thread imported",
};
