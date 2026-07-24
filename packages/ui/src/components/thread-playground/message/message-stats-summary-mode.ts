import { useSyncExternalStore } from "react";

import {
  LOCAL_STORAGE_KEYS,
  readLocalStorage,
  writeLocalStorage,
} from "@llm-space/ui/lib/local-storage";

export type MessageStatsSummaryMode = "timing" | "tokens";

const listeners = new Set<() => void>();

export function getMessageStatsSummaryMode(): MessageStatsSummaryMode {
  return readLocalStorage(LOCAL_STORAGE_KEYS.messageStatsSummaryMode) ===
    "tokens"
    ? "tokens"
    : "timing";
}

export function setMessageStatsSummaryMode(
  mode: MessageStatsSummaryMode
): void {
  writeLocalStorage(LOCAL_STORAGE_KEYS.messageStatsSummaryMode, mode);
  for (const listener of listeners) {
    listener();
  }
}

function _subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useMessageStatsSummaryMode(): {
  mode: MessageStatsSummaryMode;
  setMode: (mode: MessageStatsSummaryMode) => void;
} {
  const mode = useSyncExternalStore(
    _subscribe,
    getMessageStatsSummaryMode,
    (): MessageStatsSummaryMode => "timing"
  );
  return { mode, setMode: setMessageStatsSummaryMode };
}
