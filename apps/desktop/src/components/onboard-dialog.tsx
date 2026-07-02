"use client";

import { ArrowRightIcon, SettingsIcon, XIcon } from "lucide-react";
import { useCallback } from "react";

import { useCommands } from "@/commands";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";

import { useModels } from "./model-provider";
import { Button } from "./ui/button";
import { RainbowButton } from "./ui/rainbow-button";

/**
 * First-run onboarding dialog. Shown automatically when no models are configured
 * yet, and reachable any time via the "Onboard..." command (Help menu).
 *
 * Content is intentionally left empty for now — to be filled in later.
 */
export function OnboardDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const models = useModels();
  const { executeCommand } = useCommands();
  const handleConfigureModels = useCallback(() => {
    executeCommand({ type: "openSettings", args: { tab: "models" } });
  }, [executeCommand]);
  const handleLearnMore = useCallback(() => {
    executeCommand({ type: "openDocument", args: {} });
  }, [executeCommand]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-[760px]! overflow-hidden p-0"
        showCloseButton={false}
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          event.preventDefault();
        }}
      >
        <div className="relative">
          <img
            src="/images/onboard.png"
            alt="Onboard"
            className="w-full rounded-lg"
          />
          <DialogClose className="absolute top-2 right-2">
            <Button
              className="bg-muted/75 hover:bg-muted/85! text-foreground/80 rounded-full"
              variant="ghost"
              size="icon-sm"
            >
              <XIcon className="size-3" />
            </Button>
          </DialogClose>
          <div className="absolute bottom-0 left-0 flex items-center gap-4 pb-12 pl-12">
            {models.length === 0 ? (
              <Button
                className="border-ring/75 h-11 rounded-2xl border bg-white/10! px-6 backdrop-blur-xs"
                variant="outline"
                size="lg"
                onClick={handleConfigureModels}
              >
                <SettingsIcon className="size-3" />
                Configure models
              </Button>
            ) : (
              <DialogClose>
                <RainbowButton
                  variant="outline"
                  className="dark:bg-[red]!"
                  size="lg"
                >
                  Get started
                  <ArrowRightIcon className="size-3.5" />
                </RainbowButton>
              </DialogClose>
            )}
            <Button
              className="h-11 rounded-2xl border border-white/20 bg-white/10! px-8 backdrop-blur-xs"
              variant="outline"
              size="lg"
              onClick={handleLearnMore}
            >
              Learn more
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
