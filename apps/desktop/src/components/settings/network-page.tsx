"use client";

import {
  DEFAULT_NETWORK_SETTINGS,
  isSupportedProxyUrl,
  type NetworkSettings,
  type SystemProxyDetection,
} from "@llm-space/core";
import { useI18n } from "@llm-space/ui/i18n";
import { Input } from "@llm-space/ui/ui/input";
import { Separator } from "@llm-space/ui/ui/separator";
import { Switch } from "@llm-space/ui/ui/switch";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import {
  detectSystemProxy,
  getNetworkSettings,
  setNetworkSettings,
} from "@/client/network";

import { SettingsPage } from "./settings-page";

/** A label-left, control-right row with an optional muted hint line. */
function ToggleRow({
  title,
  hint,
  checked,
  onCheckedChange,
}: {
  title: string;
  hint?: ReactNode;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="flex flex-col gap-1">
        <span className="text-sm font-medium">{title}</span>
        {hint ? (
          <span className="text-muted-foreground text-xs">{hint}</span>
        ) : null}
      </span>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={title}
      />
    </div>
  );
}

/** A titled proxy URL field with an inline "unsupported" warning. */
function ProxyField({
  label,
  value,
  placeholder,
  disabled,
  unsupportedMessage,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  unsupportedMessage: ReactNode;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const invalid = !isSupportedProxyUrl(value);
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <Input
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
      {invalid ? (
        <span className="text-destructive text-xs">
          {unsupportedMessage}
        </span>
      ) : null}
    </div>
  );
}

/** Strip the scheme from a proxy URL for a compact "host:port" display. */
function _hostPort(url: string | null): string | null {
  if (!url) {
    return null;
  }
  try {
    const parsed = new URL(url);
    return parsed.host || url;
  } catch {
    return url.replace(/^\w+:\/\//, "");
  }
}

/** The muted "Detected: …" line under the system-proxy toggle. */
function DetectedProxy({
  detection,
  socksUnsupported,
  noSystemProxy,
  detectedSystemProxy,
}: {
  detection: SystemProxyDetection | null;
  socksUnsupported: string;
  noSystemProxy: string;
  detectedSystemProxy: (hostPort: string) => string;
}) {
  if (!detection) {
    return null;
  }
  if (detection.socksOnly) {
    return (
      <span className="text-destructive text-xs">
        {socksUnsupported}
      </span>
    );
  }
  const hostPort = _hostPort(detection.httpProxy ?? detection.httpsProxy);
  if (!hostPort) {
    return (
      <span className="text-muted-foreground text-xs">
        {noSystemProxy}
      </span>
    );
  }
  return (
    <span className="text-muted-foreground text-xs">
      {detectedSystemProxy(hostPort)}
    </span>
  );
}

export function NetworkPage() {
  const [settings, setSettings] = useState<NetworkSettings>(
    DEFAULT_NETWORK_SETTINGS
  );
  const [detection, setDetection] = useState<SystemProxyDetection | null>(null);
  const { t, fmt } = useI18n();

  useEffect(() => {
    let cancelled = false;
    void getNetworkSettings()
      .then((loaded) => {
        if (!cancelled) {
          setSettings(loaded);
        }
      })
      .catch(() => {
        // Keep defaults; a load failure is non-fatal for the form.
      });
    void detectSystemProxy()
      .then((result) => {
        if (!cancelled) {
          setDetection(result);
        }
      })
      .catch(() => {
        // Detection is best-effort; leave it unset on failure.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: NetworkSettings) => {
    setSettings(next);
    try {
      const saved = await setNetworkSettings(next);
      setSettings(saved);
    } catch (error) {
      toast.error(t.settings.network.saveFailed, {
        description:
          error instanceof Error ? error.message : t.common.toasts.tryAgain,
      });
    }
  }, [t]);

  return (
    <SettingsPage
      title={t.settings.network.title}
      description={t.settings.network.description}
      className="overflow-y-auto"
    >
      <div className="flex flex-col gap-6 pb-2">
        <ToggleRow
          title={t.settings.network.enableProxy}
          hint={t.settings.network.enableProxyHint}
          checked={settings.enabled}
          onCheckedChange={(next) => void persist({ ...settings, enabled: next })}
        />

        {settings.enabled ? (
          <>
            <Separator />

            <div className="flex flex-col gap-2">
              <ToggleRow
                title={t.settings.network.useSystemProxy}
                checked={settings.useSystemProxy}
                onCheckedChange={(next) =>
                  void persist({ ...settings, useSystemProxy: next })
                }
              />
              <DetectedProxy
                detection={detection}
                socksUnsupported={t.settings.network.socksUnsupported}
                noSystemProxy={t.settings.network.noSystemProxy}
                detectedSystemProxy={(hostPort) =>
                  fmt(t.settings.network.detectedSystemProxy, { hostPort })
                }
              />
            </div>

            {settings.useSystemProxy ? null : (
              <>
                <ProxyField
                  label={t.settings.network.httpProxy}
                  value={settings.httpProxy}
                  placeholder="http://127.0.0.1:7890"
                  unsupportedMessage={
                    <>
                      {t.settings.network.unsupportedProxy.split("http://")[0]}
                      <code>http://</code>
                      {
                        t.settings.network.unsupportedProxy
                          .split("http://")[1]
                          ?.split("https://")[0]
                      }
                      <code>https://</code>
                      {
                        t.settings.network.unsupportedProxy
                          .split("https://")[1]
                      }
                    </>
                  }
                  onChange={(value) =>
                    setSettings({ ...settings, httpProxy: value })
                  }
                  onBlur={() => void persist(settings)}
                />

                <ProxyField
                  label={t.settings.network.httpsProxy}
                  value={settings.httpsProxy}
                  placeholder="http://127.0.0.1:7890"
                  unsupportedMessage={
                    <>
                      {t.settings.network.unsupportedProxy.split("http://")[0]}
                      <code>http://</code>
                      {
                        t.settings.network.unsupportedProxy
                          .split("http://")[1]
                          ?.split("https://")[0]
                      }
                      <code>https://</code>
                      {
                        t.settings.network.unsupportedProxy
                          .split("https://")[1]
                      }
                    </>
                  }
                  onChange={(value) =>
                    setSettings({ ...settings, httpsProxy: value })
                  }
                  onBlur={() => void persist(settings)}
                />

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">
                    {t.settings.network.bypassList}
                  </span>
                  <Input
                    value={settings.noProxy}
                    placeholder={t.settings.network.bypassPlaceholder}
                    aria-label={t.settings.network.bypassList}
                    onChange={(event) =>
                      setSettings({ ...settings, noProxy: event.target.value })
                    }
                    onBlur={() => void persist(settings)}
                  />
                  <span className="text-muted-foreground text-xs">
                    {t.settings.network.bypassHint}
                  </span>
                </div>
              </>
            )}
          </>
        ) : null}
      </div>
    </SettingsPage>
  );
}
