import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  getSettingsDir,
  readJsonFileWithRecoverySync,
} from "@llm-space/core/server";

import {
  DEFAULT_SEARCH_SETTINGS,
  type SearchProviderId,
  type SearchSettings,
} from "../../shared/search";

const VALID_PROVIDERS: readonly SearchProviderId[] = ["firecrawl", "tavily"];

/**
 * Owns `settings/search.json`: the in-memory source of truth for the built-in
 * web tools' search provider and API keys. Mirrors `ModelManager`'s eager,
 * synchronous load-and-seed pattern.
 */
class SearchSettingsManager {
  private _settings: SearchSettings;

  constructor() {
    this._settings = this._loadConfig();
  }

  get(): SearchSettings {
    return { ...this._settings };
  }

  set(next: SearchSettings): SearchSettings {
    this._settings = this._normalize(next);
    this._saveConfig();
    return this.get();
  }

  private get _configPath(): string {
    return path.join(getSettingsDir(), "search.json");
  }

  private _saveConfig(): void {
    mkdirSync(getSettingsDir(), { recursive: true });
    writeFileSync(
      this._configPath,
      `${JSON.stringify(this._settings, null, 2)}\n`,
      "utf8"
    );
  }

  /**
   * Read `settings/search.json`, merging against defaults so partial or missing
   * files stay valid. Seeds the default config on disk when the file is absent.
   */
  private _loadConfig(): SearchSettings {
    const parsed = readJsonFileWithRecoverySync<Partial<SearchSettings>>(
      this._configPath,
      { ...DEFAULT_SEARCH_SETTINGS }
    );
    return this._normalize(parsed);
  }

  private _normalize(input: Partial<SearchSettings>): SearchSettings {
    const provider =
      input.provider && VALID_PROVIDERS.includes(input.provider)
        ? input.provider
        : DEFAULT_SEARCH_SETTINGS.provider;
    return {
      provider,
      firecrawlApiKey:
        typeof input.firecrawlApiKey === "string"
          ? input.firecrawlApiKey
          : DEFAULT_SEARCH_SETTINGS.firecrawlApiKey,
      tavilyApiKey:
        typeof input.tavilyApiKey === "string"
          ? input.tavilyApiKey
          : DEFAULT_SEARCH_SETTINGS.tavilyApiKey,
    };
  }
}

/** Process-wide singleton owning the search settings config. */
export const searchSettings = new SearchSettingsManager();
