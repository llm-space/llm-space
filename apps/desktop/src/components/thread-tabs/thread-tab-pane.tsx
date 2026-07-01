"use client";

import type { Thread } from "@llm-space/core";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

import { createRpcTransport, localFs } from "@/client";
import { ThreadPlayground } from "@/components/thread-playground";
import { cn } from "@/lib/utils";

// One transport for the app: stream agent runs over Electrobun RPC to the bun
// process (there is no HTTP server in the desktop app).
const rpcTransport = createRpcTransport();

interface ThreadTabPaneProps {
  path: string;
  active: boolean;
}

/**
 * One open thread. Each pane owns its own fetch + debounced persistence and stays
 * mounted while inactive (hidden via CSS) so its store, undo history, and any
 * in-progress streaming run survive tab switches.
 */
export function ThreadTabPane({ path, active }: ThreadTabPaneProps) {
  const { data: thread, isLoading } = useQuery({
    queryKey: ["thread", path],
    queryFn: () => localFs.read(path),
  });

  // Persist edits back to the same path, debounced so we don't write per keystroke.
  // `pending` holds the latest unsaved thread so we can flush it on unmount.
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<Thread | null>(null);

  const handleChange = useCallback(
    (next: Thread) => {
      pending.current = next;
      if (writeTimer.current) clearTimeout(writeTimer.current);
      writeTimer.current = setTimeout(() => {
        pending.current = null;
        void localFs.write(path, next);
      }, 500);
    },
    [path]
  );

  // Flush any pending write when the tab closes so the last edit is never dropped.
  useEffect(() => {
    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
      if (pending.current !== null) {
        void localFs.write(path, pending.current);
        pending.current = null;
      }
    };
  }, [path]);

  return (
    <div className={cn("size-full", !active && "hidden")}>
      <ThreadPlayground
        className="bg-background size-full shadow-lg"
        loading={isLoading}
        initialValue={thread}
        active={active}
        transport={rpcTransport}
        onChange={handleChange}
      />
    </div>
  );
}
