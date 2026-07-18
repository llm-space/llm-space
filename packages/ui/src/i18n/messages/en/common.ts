/**
 * Common strings shared across surfaces (buttons, OS-conditional labels,
 * generic errors). English is the canonical schema; every other locale mirrors
 * it exactly and is type-checked against this type.
 *
 * OS-conditional labels (Trash/Recycle Bin, Finder/Explorer) live here so the
 * file tree, tabs, and COMMAND_META can resolve them from one place.
 */
export const enCommon = {
  cancel: "Cancel",
  done: "Done",
  save: "Save",
  close: "Close",
  remove: "Remove",
  delete: "Delete",
  back: "Back",
  retry: "Try again",
  loading: "Loading…",
  error: "Error",
  yes: "Yes",
  no: "No",
  os: {
    // "Reveal in Finder" (macOS/Linux) vs "Reveal in Explorer" (Windows).
    revealLabel: "Reveal in Finder",
    revealExplorer: "Reveal in Explorer",
    // "Move to Trash" (macOS/Linux) vs "Move to Recycle Bin" (Windows).
    moveToTrashLabel: "Move to Trash",
    moveToRecycleBinLabel: "Move to Recycle Bin",
    trashName: "Trash",
    recycleBinName: "Recycle Bin",
  },
  toasts: {
    tryAgain: "Please try again.",
    copied: "Copied",
    copyFailed: "Failed to copy",
  },
  firecrawlLimit: {
    title: "Firecrawl daily limit reached",
    description:
      "The built-in web tools hit Firecrawl's daily limit of free, unauthenticated credits. Add a Firecrawl API key to raise the limit and keep using web fetch and search.",
    cancel: "Not now",
    configure: "Configure API key",
  },
  preview: {
    title: "Preview",
    raw: "Raw",
    markdown: "Markdown",
    html: "HTML",
    htmlPreviewTitle: "{title} HTML preview",
  },
  codeEditor: {
    retry: "Retry CodeMirror editor",
  },
};
