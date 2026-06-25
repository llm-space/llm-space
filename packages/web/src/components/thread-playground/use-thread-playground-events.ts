import type { Thread } from "@llm-space/core";
import { useEffect, useRef } from "react";

import type { ThreadStore } from "@/stores/thread-store";

export interface ThreadPlaygroundEventCallbacks {
  // eslint-disable-next-line no-unused-vars
  onChange?: (thread: Thread) => void;
  onStreamingStart?: () => void;
  onStreamingEnd?: () => void;
}

export function useThreadPlaygroundEvents(
  store: ThreadStore,
  callbacks: ThreadPlaygroundEventCallbacks
): void {
  const onChangeRef = useRef(callbacks.onChange);
  onChangeRef.current = callbacks.onChange;

  const onStreamingStartRef = useRef(callbacks.onStreamingStart);
  onStreamingStartRef.current = callbacks.onStreamingStart;

  const onStreamingEndRef = useRef(callbacks.onStreamingEnd);
  onStreamingEndRef.current = callbacks.onStreamingEnd;

  useEffect(() => {
    return store.subscribe((state, prevState) => {
      const { status } = state;
      const prevStatus = prevState.status;

      if (status === "running" && prevStatus === "idle") {
        onStreamingStartRef.current?.();
      }

      if (status === "idle" && prevStatus === "running") {
        onStreamingEndRef.current?.();
        // Flush thread changes that were suppressed while streaming.
        onChangeRef.current?.(state.thread);
        return;
      }

      if (state.thread === prevState.thread || status === "running") {
        return;
      }

      onChangeRef.current?.(state.thread);
    });
  }, [store]);
}
