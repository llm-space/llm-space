"use client";

import { ConfirmDialog } from "@llm-space/ui/components/confirm-dialog";
import { useI18n } from "@llm-space/ui/i18n";
import { Switch } from "@llm-space/ui/ui/switch";
import { useState } from "react";

import { useCommands } from "@/commands";
import { useExperimental } from "@/components/experimental-provider";

import { SettingsPage } from "./settings-page";

export function ExperimentalPage() {
  const { tracingEnabled, setTracingEnabled, reactScanEnabled, setReactScanEnabled } =
    useExperimental();
  const { executeCommand } = useCommands();
  const [reloadPromptOpen, setReloadPromptOpen] = useState(false);
  const { t, fmt } = useI18n();

  const handleReactScanChange = (next: boolean) => {
    setReactScanEnabled(next);
    // react-scan patches the reconciler at startup, so the change only lands
    // after a reload — offer to do it now.
    setReloadPromptOpen(true);
  };

  return (
    <SettingsPage title={t.settings.experimental.title}>
      <div className="flex h-14 items-center justify-between gap-4">
        <span className="flex flex-col gap-0.5 text-sm">
          {t.settings.experimental.tracing}
          <span className="text-muted-foreground text-xs">
            {t.settings.experimental.tracingHint}
          </span>
        </span>
        <Switch
          checked={tracingEnabled}
          onCheckedChange={setTracingEnabled}
          aria-label={t.settings.experimental.tracing}
        />
      </div>
      {import.meta.env.DEV ? (
        <div className="flex h-14 items-center justify-between gap-4">
          <span className="flex flex-col gap-0.5 text-sm">
            {t.settings.experimental.reactScan}
            <span className="text-muted-foreground text-xs">
              {t.settings.experimental.reactScanHint}
            </span>
          </span>
          <Switch
            checked={reactScanEnabled}
            onCheckedChange={handleReactScanChange}
            aria-label={t.settings.experimental.reactScan}
          />
        </div>
      ) : null}
      <ConfirmDialog
        open={reloadPromptOpen}
        onOpenChange={setReloadPromptOpen}
        dimBackground={false}
        title={t.settings.experimental.reloadTitle}
        description={fmt(t.settings.experimental.reloadDescription, {
          state: reactScanEnabled
            ? t.settings.experimental.enabled
            : t.settings.experimental.disabled,
        })}
        cancelLabel={t.settings.experimental.later}
        confirmLabel={t.settings.experimental.reload}
        confirmVariant="default"
        onConfirm={() => {
          setReloadPromptOpen(false);
          executeCommand({ type: "reload", args: {} });
        }}
      />
    </SettingsPage>
  );
}
