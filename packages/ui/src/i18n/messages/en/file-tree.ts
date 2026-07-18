/**
 * File tree (`file-system-tree-view/`, incl. node-actions + use-file-system-tree).
 *
 * OS-conditional labels (Trash/Recycle Bin, Finder/Explorer) are NOT duplicated
 * here — they live in `t.common.os` and are picked at the call site based on the
 * platform. Only file-tree-specific copy lives below.
 */
export const enFileTree = {
  nodeActions: {
    /** aria-label / title for the "New from Examples" hover action on a folder row. */
    newFromExamplesIn: "New from Examples in {name}",
    /** aria-label / title for the "New folder" hover action on a folder row. */
    newFolderIn: "New folder in {name}",
    /** aria-label / title for the "..." overflow menu trigger on a folder/file row. */
    moreActionsFor: "More actions for {name}",
    /** "Share..." menu item (files only). */
    share: "Share...",
    /** "Import from Files..." menu item (directories only). */
    importFromFiles: "Import from Files...",
    /** "Import from Clipboard" menu item (directories only). */
    importFromClipboard: "Import from Clipboard",
    /** "Copy" menu item (files only). */
    copy: "Copy",
    /** "Duplicate" menu item. */
    duplicate: "Duplicate",
    /** "Rename" menu item. */
    rename: "Rename",
  },
  rootActions: {
    /** aria-label / title for the root "New from Examples" hover action. */
    newFromExamples: "New from Examples",
    /** aria-label / title for the root "New folder" hover action. */
    newFolderInRoot: "New folder in workspace root",
    /** aria-label / title for the root "Settings" hover action. */
    settings: "Settings",
    /** aria-label / title for the root "..." overflow menu trigger. */
    moreActionsForRoot: "More actions for workspace root",
    /** "Refresh" menu item. */
    refresh: "Refresh",
  },
  tree: {
    /** Header brand text shown when the tree header has no `headerStart`. */
    brand: "LLM Space 4",
    /** Empty-state title when the workspace has no threads. */
    emptyTitle: "No Threads Yet",
    /** Empty-state description shown under {@link emptyTitle}. */
    emptyDescription: "Create a thread to get started.",
  },
  confirmDelete: {
    /** Confirm-delete dialog title: "Move {name} to the {trash}?". */
    title: "Move “{name}” to the {trash}?",
    /** Confirm-delete dialog description. */
    description: "You can restore it from the {trash} later.",
    /** Confirm-delete dialog confirm button label: "Move to {trash}". */
    confirmLabel: "Move to {trash}",
  },
  confirmReplace: {
    /** Confirm-replace dialog title: "Replace {name}?". */
    title: "Replace “{name}”?",
    /** Confirm-replace description for a folder collision. */
    folderDescription:
      "A folder with this name already exists here. Replacing it moves the existing folder to the {trash}.",
    /** Confirm-replace description for a thread collision. */
    threadDescription:
      "A thread with this name already exists here. Replacing it moves the existing thread to the {trash}.",
    /** Confirm-replace dialog confirm button label. */
    confirmLabel: "Replace",
  },
  toasts: {
    /** Toast shown when a move would drop a folder into itself or its descendant. */
    cannotMoveIntoItself: "Cannot move a folder into itself.",
  },
};
