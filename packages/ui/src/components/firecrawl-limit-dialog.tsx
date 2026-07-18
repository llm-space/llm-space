import { create } from "zustand";

import { ConfirmDialog } from "@llm-space/ui/components/confirm-dialog";
import { useHostServices } from "@llm-space/ui/host";
import { useI18n } from "@llm-space/ui/i18n";

interface FirecrawlLimitDialogState {
  open: boolean;
  openDialog: () => void;
  setOpen: (open: boolean) => void;
}

/**
 * App-wide singleton controlling the Firecrawl daily-limit dialog. Unlike the
 * per-tab thread store, this is a single global instance because the limit error
 * can fire from multiple call sites (single tool call, "Call all" batch).
 */
const useFirecrawlLimitDialogStore = create<FirecrawlLimitDialogState>((set) => ({
  open: false,
  openDialog: () => set({ open: true }),
  setOpen: (open) => set({ open }),
}));

/** Open the dialog from non-React call sites (tool-call catch blocks). */
export function openFirecrawlLimitDialog() {
  useFirecrawlLimitDialogStore.getState().openDialog();
}

/**
 * Mounted once inside `CommandProvider` (see `app/page.tsx`) so its confirm
 * action can dispatch the `openSettings` command.
 */
export function FirecrawlLimitDialog() {
  const open = useFirecrawlLimitDialogStore((state) => state.open);
  const setOpen = useFirecrawlLimitDialogStore((state) => state.setOpen);
  const { actions } = useHostServices();
  const { t } = useI18n();
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      title={t.common.firecrawlLimit.title}
      description={t.common.firecrawlLimit.description}
      cancelLabel={t.common.firecrawlLimit.cancel}
      confirmLabel={t.common.firecrawlLimit.configure}
      confirmVariant="default"
      onConfirm={() => {
        actions.openSettings("search");
        setOpen(false);
      }}
    />
  );
}
