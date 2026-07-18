/**
 * Shared i18n types for the desktop app — imported by both the bun main
 * process and the webview renderer. The renderer's React i18n core lives in
 * `@llm-space/ui/i18n`; this module holds only the language code type so the
 * two sides agree on the persistence contract without the bun process pulling
 * in React.
 *
 * Keep `Lang` in lockstep with `LANGUAGES` in `packages/ui/src/i18n/index.tsx`.
 */
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh", label: "简体中文" },
] as const;

export type Lang = (typeof LANGUAGES)[number]["code"];

/** localStorage key shared with the web app + the renderer anti-FOUC bootstrap. */
export const LANGUAGE_STORAGE_KEY = "llm-space-lang";

/** Whether a value is a supported language code. */
export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "zh";
}
