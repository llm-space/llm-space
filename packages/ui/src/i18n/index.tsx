"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { enMessages, type Messages } from "./messages/en";
import { zhMessages } from "./messages/zh";

/**
 * The languages the app ships in. `label` is the native name shown in the
 * switcher. Simplified Chinese is the default fallback when no preference is
 * saved and the OS locale can't be determined (per the project i18n decision).
 */
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh", label: "简体中文" },
] as const;

export type Lang = (typeof LANGUAGES)[number]["code"];

/**
 * localStorage key for the persisted language choice. Reused from the original
 * web landing i18n so existing web users keep their choice. The desktop app
 * additionally persists to `settings/language.json` (server-authoritative) and
 * keeps this key in sync so the renderer anti-FOUC bootstrap can read it before
 * the RPC round-trip resolves.
 */
export const LANGUAGE_STORAGE_KEY = "llm-space-lang";

const MESSAGES: Record<Lang, Messages> = {
  en: enMessages,
  zh: zhMessages,
};

/** The canonical message-tree type (derived from `en`). */
export type { Messages } from "./messages/en";

/**
 * Variable map passed to {@link t}. Values are interpolated into `{name}`
 * placeholders. `count` (when present) drives plural selection via
 * {@link plural}.
 */
export type Vars = Record<string, string | number>;

interface I18nValue {
  lang: Lang;
  t: Messages;
  /** Translate a string with `{name}` interpolation. */
  fmt: (template: string, vars?: Vars) => string;
  /**
   * Pick `one` vs `other` based on a count. Selection is purely count-based
   * (`count === 1` → `one`, else `other`) and locale-agnostic. Chinese has no
   * grammatical plural distinction, so its `one`/`other` entries are usually
   * identical — but a zh translator may instead encode the distinction by
   * wording, in which case both forms are honored. Pass the count that the noun
   * phrase agrees with (e.g. the failure count for "tool call failed", not the
   * total attempted). Both forms must be kept in every locale's catalog.
   */
  plural: (count: number, one: string, other: string) => string;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

/** Default language when nothing is stored and the locale is ambiguous. */
const DEFAULT_LANG: Lang = "zh";

function _detectLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  // An explicit past choice always wins.
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === "en" || stored === "zh") return stored;
  // Otherwise fall back to the browser's preferred language — any Chinese
  // variant (zh, zh-CN, zh-TW, …) resolves to `zh`; everything else to the
  // default (zh), per the project decision (Chinese is the shipped default).
  const preferred = window.navigator.languages ?? [window.navigator.language];
  if (preferred.some((l) => l?.toLowerCase().startsWith("zh"))) return "zh";
  return DEFAULT_LANG;
}

/** Substitute `{name}` placeholders in a template with `vars`. */
function _interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key];
    if (value === undefined) {
      // A missing var usually means a typo in the call site (wrong key name) or
      // a stale catalog entry after a copy change. Leak the literal `{name}` so
      // the breakage is visible, and warn in dev so it's caught in review
      // rather than shipping silently into aria-labels and toasts. `import.meta.env`
      // is Vite-provided; cast since the ui package tsconfig has no vite/client types
      // (the consuming apps do). The `DEV` flag is statically false in prod builds.
      const env = (import.meta as { env?: { DEV?: boolean } }).env;
      if (env?.DEV) {
        console.warn(`[i18n] missing var {${key}} in template: ${template}`);
      }
      return match;
    }
    return String(value);
  });
}

/**
 * Plural selector. Returns `one` for a singular count (1), `other` otherwise.
 *
 * Note: the selection is purely count-based and locale-agnostic. Chinese has no
 * grammatical plural distinction, so its `one`/`other` catalog entries are
 * usually identical strings — but they need NOT be: a zh translator may encode
 * the singular/plural distinction by wording (e.g. "已检测到服务商" vs
 * "已检测到多个服务商"). Because this returns `one` when `count === 1`, such
 * intentional zh distinctions are honored at runtime. Keep both forms in every
 * locale's catalog so the schema is uniform.
 */
function _plural(count: number, one: string, other: string): string {
  return count === 1 ? one : other;
}

export interface I18nProviderProps {
  children: ReactNode;
  /** Initial language (e.g. hydrated from the bun-side settings file). */
  initialLang?: Lang;
  /**
   * Called when the language changes, after the choice is persisted to
   * localStorage. Hosts wire this to their persistence seam (desktop: the
   * `setLanguage` RPC + native-menu rebuild; web: nothing more — localStorage
   * is the source of truth).
   */
  onLangChange?: (lang: Lang) => void;
}

export function I18nProvider({
  children,
  initialLang,
  onLangChange,
}: I18nProviderProps) {
  const [lang, setLangState] = useState<Lang>(
    () => initialLang ?? _detectLang()
  );

  // Once the user (or any local `setLang`) has taken control of the language,
  // a late-arriving server value must NOT clobber it. This guards the reconcile
  // effect below against the race where the mount-time `getLanguage` RPC
  // resolves AFTER the user already switched language in the UI — without it,
  // the stale server response would silently revert their choice and rewrite
  // localStorage to the old value.
  const userTouchedRef = useRef(false);

  // Reflect the language onto <html lang> for a11y / screen readers.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback(
    (next: Lang) => {
      userTouchedRef.current = true;
      setLangState(next);
      try {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
      } catch {
        // Ignore storage failures (private mode, etc.) — the choice still
        // applies for this session.
      }
      onLangChange?.(next);
    },
    [onLangChange]
  );

  // If the host hydrates an `initialLang` after mount (e.g. the bun-side
  // settings file disagrees with localStorage), reconcile — but only until the
  // user has taken control of the language. After that, a late-arriving server
  // value (which may carry a stale preference from before a fresh local
  // choice) must not override the user's pick.
  useEffect(() => {
    if (
      initialLang &&
      !userTouchedRef.current &&
      initialLang !== lang
    ) {
      setLangState(initialLang);
      try {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, initialLang);
      } catch {
        // Non-fatal.
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reconcile on server value changes only
  }, [initialLang]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      t: MESSAGES[lang],
      fmt: (template, vars) => _interpolate(template, vars),
      plural: _plural,
      setLang,
    }),
    [lang, setLang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within <I18nProvider>");
  }
  return ctx;
}

/** Convenience hook for callers that only need the message tree. */
export function useT(): Messages {
  return useI18n().t;
}
