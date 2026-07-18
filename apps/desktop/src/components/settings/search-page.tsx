"use client";

import {
  DEFAULT_SEARCH_SETTINGS,
  type SearchProviderId,
  type SearchSettings,
} from "@llm-space/core";
import { useI18n } from "@llm-space/ui/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@llm-space/ui/ui/select";
import { Separator } from "@llm-space/ui/ui/separator";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { getSearchSettings, setSearchSettings } from "@/client/search";

import { ApiKeyField } from "./api-key-field";
import { SettingsPage } from "./settings-page";

export function SearchPage() {
  const [settings, setSettings] = useState<SearchSettings>(
    DEFAULT_SEARCH_SETTINGS
  );
  const { t } = useI18n();

  useEffect(() => {
    let cancelled = false;
    void getSearchSettings()
      .then((loaded) => {
        if (!cancelled) {
          setSettings(loaded);
        }
      })
      .catch(() => {
        // Keep defaults; a load failure is non-fatal for the form.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: SearchSettings) => {
    try {
      const saved = await setSearchSettings(next);
      setSettings(saved);
    } catch (error) {
      toast.error(t.settings.search.saveFailed, {
        description:
          error instanceof Error ? error.message : t.common.toasts.tryAgain,
      });
    }
  }, [t]);

  return (
    <SettingsPage
      title={t.settings.search.title}
      description={
        <>
          {t.settings.search.descriptionBefore}
          <code>web_search</code>
          {t.settings.search.descriptionAfter}
          <code>web_fetch</code>
          {t.settings.search.descriptionTail}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex h-14 items-center justify-between gap-4">
          <span className="text-sm">{t.settings.search.provider}</span>
          <Select
            value={settings.provider}
            onValueChange={(value) =>
              void persist({ ...settings, provider: value as SearchProviderId })
            }
          >
            <SelectTrigger className="w-40" aria-label={t.settings.search.provider}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brave">Brave Search</SelectItem>
              <SelectItem value="firecrawl">Firecrawl</SelectItem>
              <SelectItem value="tavily">Tavily</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <ApiKeyField
          label={t.settings.search.braveApiKey}
          value={settings.braveApiKey}
          getKeyUrl="https://api-dashboard.search.brave.com/app/keys"
          onChange={(e) =>
            setSettings({ ...settings, braveApiKey: e.target.value })
          }
          onBlur={() => void persist(settings)}
        />

        <ApiKeyField
          label={t.settings.search.firecrawlApiKey}
          value={settings.firecrawlApiKey}
          getKeyUrl="https://www.firecrawl.dev/app/api-keys"
          onChange={(e) =>
            setSettings({ ...settings, firecrawlApiKey: e.target.value })
          }
          onBlur={() => void persist(settings)}
        />

        <ApiKeyField
          label={t.settings.search.tavilyApiKey}
          value={settings.tavilyApiKey}
          getKeyUrl="https://app.tavily.com/home"
          onChange={(e) =>
            setSettings({ ...settings, tavilyApiKey: e.target.value })
          }
          onBlur={() => void persist(settings)}
        />

        <p className="text-muted-foreground text-xs">
          {t.settings.search.envHintBefore}
          <code>$</code>
          {t.settings.search.envHintAfter}
          <code>$BRAVE_SEARCH_API_KEY</code>, <code>$FIRECRAWL_API_KEY</code>,{" "}
          <code>$TAVILY_API_KEY</code>
          {t.settings.search.envHintTail}
        </p>
      </div>
    </SettingsPage>
  );
}
