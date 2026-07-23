"use client";

import { memo } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@llm-space/ui/ui/dialog";

import {
  PromptVariablesPanel,
  type PromptVariableSelection,
} from "./prompt-variables-panel";

interface PromptVariablesDialogProps {
  open: boolean;
  disabled?: boolean;
  initialSelection?: PromptVariableSelection | null;
  onOpenChange: (open: boolean) => void;
}

function _PromptVariablesDialog({
  open,
  disabled,
  initialSelection,
  onOpenChange,
}: PromptVariablesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[728px] max-h-[calc(100vh-4rem)] w-[min(1080px,calc(100vw-2rem))] max-w-none! flex-col gap-0 overflow-hidden p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle>Variables</DialogTitle>
          <DialogDescription>
            Use `{"{{variable_name}}"}` as placeholder in your prompt, messages
            and tool results to reference the variable. e.g. `
            {"{{current_date}}"}` will be replaced with the current date.
          </DialogDescription>
        </DialogHeader>
        <PromptVariablesPanel
          className="min-h-0 grow"
          disabled={disabled}
          initialSelection={initialSelection}
        />
      </DialogContent>
    </Dialog>
  );
}

export const PromptVariablesDialog = memo(_PromptVariablesDialog);
