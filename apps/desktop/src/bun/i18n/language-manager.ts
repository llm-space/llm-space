import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { getSettingsDir } from "@llm-space/core/server";

import type { Lang } from "../../shared/i18n";
import { isLang } from "../../shared/i18n";
import { getOsLocale } from "../app/locales";

/**
 * On-disk shape of `settings/language.json`. `language` is `null` until the
 * user picks a language explicitly; until then the OS locale drives the
 * resolved language (see {@link LanguageManager.get}).
 */
interface PersistedLanguage {
  language: Lang | null;
}

/**
 * The server-authoritative language preference. Owns `settings/language.json`,
 * mirroring `SearchSettingsManager`'s eager load-and-seed pattern. The renderer
 * reads the resolved language via the `getLanguage` RPC and writes via
 * `setLanguage` (which also rebuilds the native menu).
 *
 * Resolution precedence (matches the web app + the renderer's anti-FOUC
 * bootstrap): saved preference > OS locale > Simplified Chinese (the shipped
 * default).
 */
export class LanguageManager {
  private _language: Lang | null;

  constructor() {
    this._language = this._loadConfig().language;
  }

  /**
   * The language to use right now: the saved preference if set, otherwise the
   * OS locale if it's Chinese, otherwise `zh` (the default). Never `null`.
   */
  get(): Lang {
    return this._language ?? _fromOsLocale();
  }

  /** The raw saved preference (`null` = "follow the OS"). */
  getSaved(): Lang | null {
    return this._language;
  }

  /**
   * Persist a language choice. `null` clears the preference so the app follows
   * the OS locale again. Returns the resolved language.
   */
  set(language: Lang | null): Lang {
    this._language = language;
    this._saveConfig();
    return this.get();
  }

  private get _configPath(): string {
    return path.join(getSettingsDir(), "language.json");
  }

  private _saveConfig(): void {
    mkdirSync(getSettingsDir(), { recursive: true });
    const config: PersistedLanguage = { language: this._language };
    writeFileSync(this._configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  }

  /**
   * Read `settings/language.json`. A missing/partial/corrupt file is treated as
   * "follow the OS" and never blocks startup. The file is NOT seeded on first
   * run (unlike analytics.json) so a fresh install stays locale-following
   * rather than freezing a guess to disk.
   */
  private _loadConfig(): PersistedLanguage {
    try {
      const parsed = JSON.parse(
        readFileSync(this._configPath, "utf8")
      ) as Partial<PersistedLanguage>;
      return { language: isLang(parsed.language) ? parsed.language : null };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        // Corrupt/unreadable — best-effort: follow the OS.
      }
      return { language: null };
    }
  }
}

/**
 * Resolve the OS locale to a supported language. Chinese OS → `zh`; any other
 * detectable locale → `en`; undetectable (`""`) → `zh` (the shipped default).
 */
function _fromOsLocale(): Lang {
  const locale = getOsLocale();
  if (locale === "") return "zh";
  return locale.startsWith("zh") ? "zh" : "en";
}
