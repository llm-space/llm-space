"use client";

import type { Thread } from "@llm-space/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { localFs } from "@/client";
import { FileSystemTreeView } from "@/components/file-system-tree-view/file-system-tree-view";
import { ThreadPlayground } from "@/components/thread-playground";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function HomePage() {
  const qc = useQueryClient();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // Read the selected thread from storage.
  const { data: thread, isLoading } = useQuery({
    queryKey: ["thread", selectedPath],
    queryFn: () => localFs.read(selectedPath!),
    enabled: selectedPath !== null,
  });

  // Persist edits back to the same path, debounced so we don't write per keystroke.
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleChange = useCallback(
    (next: Thread) => {
      if (selectedPath === null) return;
      if (writeTimer.current) clearTimeout(writeTimer.current);
      writeTimer.current = setTimeout(() => {
        void localFs.write(selectedPath, next);
      }, 500);
    },
    [selectedPath]
  );

  // Flush any pending write when switching files or unmounting.
  useEffect(() => {
    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [selectedPath]);

  return (
    <ResizablePanelGroup className="h-size">
      <ResizablePanel className="bg-background" defaultSize="16.7%">
        <FileSystemTreeView
          className="size-full"
          onSelectFile={setSelectedPath}
          onRemove={(removed) => {
            // Close the open thread if it (or a containing folder) was deleted.
            setSelectedPath((current) =>
              current !== null &&
              (current === removed || current.startsWith(`${removed}/`))
                ? null
                : current
            );
          }}
          onMove={(from, to) => {
            // Follow the open thread if it (or a containing folder) was renamed
            // or moved.
            if (selectedPath === null) return;
            let next: string | null = null;
            if (selectedPath === from) next = to;
            else if (selectedPath.startsWith(`${from}/`))
              next = to + selectedPath.slice(from.length);
            if (next === null) return;
            // Carry the read cache to the new key so the playground doesn't reload.
            const cached = qc.getQueryData<Thread>(["thread", selectedPath]);
            if (cached !== undefined) qc.setQueryData(["thread", next], cached);
            setSelectedPath(next);
          }}
        />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>
        {selectedPath === null ? (
          <div className="text-muted-foreground flex size-full items-center justify-center text-sm">
            Select a thread to open
          </div>
        ) : (
          <ThreadPlayground
            key={selectedPath}
            className="bg-background size-full shadow-lg"
            loading={isLoading}
            initialValue={thread}
            onChange={handleChange}
          />
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
