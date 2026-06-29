"use client";

import { type FunctionTool } from "@llm-space/core";
import { PlusIcon } from "lucide-react";
import { useCallback, useState } from "react";

import {
  useThreadStore,
  useThreadStoreActions,
} from "@/components/thread-playground/stores/thread-store";
import { useAutoAnimation } from "@/lib/use-auto-animation";
import { cn } from "@/lib/utils";

import { Button } from "../../ui/button";

import { ToolEditorDialog } from "./tool-editor-dialog";
import { ToolListItem } from "./tool-list-item";

export function ToolListView({
  className,
  readonly,
}: {
  className?: string;
  readonly?: boolean;
}) {
  const tools = useThreadStore((s) => s.thread.context?.tools);
  const { removeTool } = useThreadStoreActions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<FunctionTool | null>(null);

  const [animationContainerRef] = useAutoAnimation({ duration: 150 });

  const openAddDialog = useCallback(() => {
    setEditingTool(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((tool: FunctionTool) => {
    setEditingTool(tool);
    setDialogOpen(true);
  }, []);

  const handleRemoveTool = useCallback(
    (tool: FunctionTool) => {
      removeTool(tool.name);
    },
    [removeTool]
  );

  return (
    <>
      <div
        ref={animationContainerRef}
        className={cn("group flex min-w-0 grow flex-wrap gap-2.5", className)}
      >
        {tools?.map((t) => (
          <ToolListItem
            key={t.name}
            tool={t}
            readonly={readonly}
            onEdit={openEditDialog}
            onRemove={handleRemoveTool}
          />
        ))}
        <Button
          className={cn(
            "-ml-1 px-0 transition-opacity hover:bg-transparent!",
            readonly ? "opacity-30!" : "opacity-50"
          )}
          variant="ghost"
          size="sm"
          disabled={readonly}
          onClick={openAddDialog}
        >
          <PlusIcon className="size-3" />
          Add Tool
        </Button>
      </div>
      <ToolEditorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tool={editingTool}
      />
    </>
  );
}
