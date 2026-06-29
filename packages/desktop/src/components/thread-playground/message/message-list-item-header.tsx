import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import type { Message } from "@llm-space/core";
import {
  BotIcon,
  ChevronDownIcon,
  GripVerticalIcon,
  MinusCircle,
  PlayCircleIcon,
  UserIcon,
} from "lucide-react";
import { memo, useCallback, useMemo } from "react";

import { cn } from "@/lib/utils";
import { useThreadStoreActions } from "@/stores/thread-store";

import { Tooltip } from "../../tooltip";
import { Button } from "../../ui/button";

import { AddImagesMenu } from "./add-images-menu";

function _MessageListItemHeader({
  message,
  readonly = false,
  collapsed,
  dragHandleProps,
}: {
  message: Message;
  readonly?: boolean;
  collapsed?: boolean;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}) {
  const { run, removeMessage, toggleMessageRole, toggleMessageCollapsed } =
    useThreadStoreActions();
  const runnable = useMemo(
    () =>
      message.role === "user" ||
      (message.role === "assistant" &&
        message.toolCalls &&
        message.toolCalls.length > 0),
    [message]
  );
  const handleRun = useCallback(async () => {
    await run(message.id);
  }, [run, message.id]);
  const handleRemove = useCallback(() => {
    removeMessage(message.id);
  }, [removeMessage, message.id]);
  const handleToggleMessageRole = useCallback(() => {
    toggleMessageRole(message.id);
  }, [toggleMessageRole, message.id]);
  const handleToggleMessageCollapse = useCallback(() => {
    toggleMessageCollapsed(message.id);
  }, [toggleMessageCollapsed, message.id]);
  return (
    <header className="flex w-full shrink-0 items-center px-3 pt-2">
      <Tooltip content="Drag to reorder">
        <div
          {...dragHandleProps}
          className={cn(
            "text-muted-foreground hover:text-foreground -ml-3.5 flex shrink-0 cursor-grab items-center opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100",
            readonly ? "invisible" : ""
          )}
        >
          <GripVerticalIcon className="size-4" />
        </div>
      </Tooltip>
      <div className="flex shrink-0 items-center">
        <Tooltip content="Click to toggle role">
          <Button
            className="-translate-x-0.5 px-2"
            variant="outline"
            size="sm"
            disabled={readonly}
            onClick={handleToggleMessageRole}
          >
            <div className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1">
              {message.role === "user" ? (
                <>
                  <UserIcon className="size-3" />
                  <div>User</div>
                </>
              ) : (
                <>
                  <BotIcon className="size-3" />
                  <div>Assistant</div>
                </>
              )}
            </div>
          </Button>
        </Tooltip>
      </div>
      <div
        className="h-full min-h-full min-w-0 grow"
        onClick={handleToggleMessageCollapse}
      >
        &nbsp;
      </div>
      <div
        className={cn(
          "flex shrink-0 items-center opacity-0 transition-opacity",
          !readonly && "group-hover:opacity-100"
        )}
      >
        {message.role === "user" && (
          <AddImagesMenu messageId={message.id} disabled={readonly} />
        )}
        <Tooltip
          content={runnable ? "Run from this message" : "No runnable content"}
        >
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={readonly || !runnable}
            onClick={handleRun}
          >
            <PlayCircleIcon className="size-4" />
          </Button>
        </Tooltip>
        <Tooltip content="Remove message">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={readonly}
            onClick={handleRemove}
          >
            <MinusCircle className="size-4" />
          </Button>
        </Tooltip>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={readonly}
          onClick={handleToggleMessageCollapse}
        >
          <ChevronDownIcon
            className={cn(
              "size-4 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-in-out",
              collapsed && "-rotate-90"
            )}
          />
        </Button>
      </div>
    </header>
  );
}

export const MessageListItemHeader = memo(_MessageListItemHeader);
