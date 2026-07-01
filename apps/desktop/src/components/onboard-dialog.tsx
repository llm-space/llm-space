"use client";

import { ArrowRightIcon, SettingsIcon } from "lucide-react";
import { useCallback } from "react";

import { useCommands } from "@/commands";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { Button } from "./ui/button";

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
      >
        <div className="relative">
          <img
            src="/images/onboard.png"
            alt="Onboard"
            className="w-full rounded-lg"
          />
          <div className="absolute bottom-0 left-0 flex gap-4 pb-12 pl-12">
            <Button
              variant="outline"
              className="rounded-2xl border border-white/20 bg-white/10! px-5 py-5 backdrop-blur-xs"
              size="lg"
              onClick={handleConfigureModels}
            >
              <SettingsIcon className="size-3" />
              Configure models
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl border border-white/20 bg-white/10! px-5 py-5 backdrop-blur-xs"
              size="lg"
              onClick={handleLearnMore}
            >
              Learn more
              <ArrowRightIcon className="size-3" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
