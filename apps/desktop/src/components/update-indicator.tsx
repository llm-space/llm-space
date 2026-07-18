"use client";


import { Tooltip } from "@llm-space/ui/components/tooltip";
import { useI18n } from "@llm-space/ui/i18n";
import { Button } from "@llm-space/ui/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@llm-space/ui/ui/popover";
import { ArrowDownToLineIcon } from "lucide-react";

import { useCommands } from "@/commands";
import { useUpdateStatus } from "@/components/update-status-provider";

/**
 * The persistent "update ready" affordance: a badged icon button at the right
 * end of the tab toolbar (this app has no status bar; the toolbar is the only
 * always-visible chrome). Renders nothing until an update is downloaded. Click
 * opens a small popover with a confirm — a bare icon click must not restart the
 * app out from under the user. The native menu's "Restart to Update" is the
 * backstop for when no tabs are open (the toolbar is then hidden).
 */
export function UpdateIndicator() {
  const { readyVersion } = useUpdateStatus();
  const { executeCommand } = useCommands();
  const { t, fmt } = useI18n();
  if (!readyVersion) return null;

  return (
    <Popover>
      <Tooltip content={t.update.indicator.tooltipLabel}>
        <PopoverTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={t.update.indicator.ariaLabel}
            className="relative"
          >
            <ArrowDownToLineIcon />
            <span className="bg-primary absolute top-1 right-1 size-1.5 rounded-full" />
          </Button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent align="end" className="flex w-64 flex-col gap-2">
        <span className="text-sm font-medium">{t.update.indicator.readyLabel}</span>
        <span className="text-muted-foreground text-xs">
          {fmt(t.update.indicator.downloadedHint, { version: readyVersion })}
        </span>
        <Button
          size="sm"
          className="mt-1 w-full"
          onClick={() =>
            executeCommand({ type: "applyUpdateAndRestart", args: {} })
          }
        >
          {t.update.indicator.restartNow}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
