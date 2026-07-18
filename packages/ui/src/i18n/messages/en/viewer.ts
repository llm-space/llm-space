/**
 * Web shared-thread viewer + not-found (`apps/web/src/thread-viewer.tsx`,
 * `apps/web/src/not-found.tsx`). English is the canonical schema; `zh` mirrors
 * it exactly.
 */
export const enViewer = {
  loading: {
    /** Spinner label shown while the shared thread is being read. */
    loadingSharedThread: "Loading shared thread…",
    /** Fallback error when reading fails and the error has no message. */
    failedToLoad: "Failed to load.",
  },
  actions: {
    /** Button that hands off to the installed desktop app via deep link. */
    openInLlmSpace: "Open in LLM Space",
  },
  fullscreen: {
    /** Tooltip + aria when not full screen. */
    enterFullScreen: "Full screen",
    /** Tooltip when full screen. */
    exitFullScreen: "Exit full screen",
    /** aria-label when full screen (pressed). */
    exitFullScreenAria: "Exit full screen",
    /** aria-label when not full screen. */
    enterFullScreenAria: "Enter full screen",
  },
  meta: {
    /** Uppercase eyebrow label above the shared-thread title. */
    sharedThread: "Shared thread",
    /** Fallback title when the shared thread has none. */
    untitledThread: "Untitled thread",
    /** "Last updated {date}" — interpolated date is already locale-formatted. */
    lastUpdated: "Last updated {date}",
    /** Tooltip "Created {date}" — interpolated date is locale-formatted. */
    created: "Created {date}",
    /** "Shared by {author}" — interpolated author name. */
    sharedBy: "Shared by {author}",
  },
  notFound: {
    /** Uppercase eyebrow label for the not-found page. */
    eyebrow: "Not found",
    /** Heading for the not-found page. */
    title: "We couldn't open this shared thread",
    /** Default body when no specific error message is supplied. */
    description: "The link may be broken, private, or the thread no longer exists.",
    /** Button returning to the landing/homepage. */
    backToLlmSpace: "Back to LLM Space",
  },
};
