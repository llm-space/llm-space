/**
 * Thread tabs (`thread-tabs/`: thread-tabs, thread-tab-pane, trace-tab-pane) +
 * page shell (`app/page.tsx`) + welcome screen (`components/welcome.tsx`) +
 * start-from-example dialog (`components/start-from-example-dialog.tsx`).
 *
 * Shared between the welcome and tabs migration agents: each owns a nested
 * group (welcome/startExample/page for the welcome agent; tabsBar/pane/trace
 * for the tabs agent) and the `strings` placeholder is kept for any keys not
 * yet migrated. POPULATED BY THE i18n MIGRATION WORKFLOW.
 *
 * OS-conditional labels (Trash/Recycle Bin, Finder/Explorer) are NOT duplicated
 * here — they live in `t.common.os` and are picked at the call site based on
 * the platform. Generic "Error" toast titles reuse `t.common.error`.
 */
export const enTabs = {
  // Kept for the tabs agent / unmigrated keys. Do not delete.
  strings: {} as Record<string, string>,
  welcome: {
    title: "Welcome to LLM Space 4",
    description:
      "Start with a ready agent thread, create a blank one, or open an existing file from the left side panel.",
    startFromExamples: "Start from examples",
    blankThread: "Blank thread",
    configureModels: "Configure models",
    learnMore: "Learn more",
  },
  startExample: {
    title: "Start from examples",
    description: "Choose a prompt example to create a new thread.",
  },
  page: {
    sidebarFiles: "Files",
    sidebarTraces: "Traces",
    tracesBetaBadge: "Beta",
    dropFilesHint: "Drop files to import as threads",
    importThreadFilesAria: "Import thread files",
    importNone: "No threads could be imported from the selected files.",
    importSuccessOne: "Imported {count} thread",
    importSuccessOther: "Imported {count} threads",
    filesSkippedOne: "{count} file skipped",
    filesSkippedOther: "{count} files skipped",
  },
  tabsBar: {
    /** Tooltip + aria-label for the sidebar toggle when the sidebar is open. */
    hideSidebar: "Hide sidebar",
    /** Tooltip + aria-label for the sidebar toggle when the sidebar is closed. */
    showSidebar: "Show sidebar",
    /** Tooltip + aria-label for the "New blank thread" toolbar button. */
    newBlankThread: "New blank thread",
    /** aria-label stamped on a tab: "Open {label}". */
    openLabel: "Open {label}",
    /** aria-label stamped on a tab's close button: "Close {label}". */
    closeLabel: "Close {label}",
    /** Tab context-menu "Refresh" item. */
    refresh: "Refresh",
    /** Tab context-menu "Close" item. */
    close: "Close",
    /** Tab context-menu "Close Others" item. */
    closeOthers: "Close Others",
    /** Tab context-menu "Close All" item. */
    closeAll: "Close All",
    /** Tab context-menu "Share..." item (thread tabs only). */
    share: "Share...",
  },
  pane: {
    /** Toast description when a thread file can't be read: "File not found: {path}". */
    fileNotFound: "File not found: {path}",
    /** Toast description fallback when a thread refresh fails. */
    failedToRefresh: "Failed to refresh",
  },
  trace: {
    /** Toast shown after the trace ID is copied to the clipboard. */
    traceIdCopied: "Trace ID copied",
    /** Toast shown when copying the trace ID fails. */
    couldNotCopyTraceId: "Could not copy trace ID",
    /** Badge label naming the trace source. */
    langfuse: "Langfuse",
    /** Tooltip for the "Copy Trace ID" button. */
    copyTraceIdTitle: "Copy Trace ID",
    /** aria-label for the "Copy trace ID" button. */
    copyTraceIdAria: "Copy trace ID",
    /** Toast description fallback when a trace workbench can't be read. */
    traceWorkbenchNotFound: "Trace workbench not found",
    /** Toast description fallback when a trace refresh fails. */
    failedToRefreshTrace: "Failed to refresh trace",
    /** Title validation error: empty title. */
    traceTitleRequired: "Trace title is required.",
    /** Title validation error: control character present. */
    traceTitleControlChar: "Trace title contains a control character.",
  },
};
