"use client";

import { I18nProvider, type Lang } from "@llm-space/ui/i18n";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { electrobun } from "@/lib/electrobun";

/**
 * Desktop i18n provider. Hydrates the active language from the bun-side
 * `settings/language.json` (resolved server-side: saved preference → OS locale
 * → `zh`), and persists changes back through the `setLanguage` RPC — which also
 * rebuilds the native menu. Listens for `languageChanged` so a future
 * cross-window change keeps this renderer in sync.
 *
 * The {@link I18nProvider} already seeds an initial language from localStorage
 * (`llm-space-lang`) so there's no first-paint flash; once the RPC resolves we
 * reconcile to the server-authoritative value.
 */
export function DesktopI18nProvider({ children }: { children: ReactNode }) {
  const [initialLang, setInitialLang] = useState<Lang | undefined>(undefined);

  // Pull the server-resolved language once on mount.
  useEffect(() => {
    let cancelled = false;
    void electrobun.rpc?.request
      .getLanguage({})
      .then(({ language }) => {
        if (!cancelled) setInitialLang(language);
      })
      .catch(() => {
        // Non-fatal: the provider's localStorage-seeded default stands.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep in sync if the language changes elsewhere (e.g. another window).
  useEffect(() => {
    const rpc = electrobun.rpc;
    if (!rpc) return;
    const onChange = ({ language }: { language: Lang }) => {
      setInitialLang(language);
    };
    rpc.addMessageListener("languageChanged", onChange);
    return () => rpc.removeMessageListener("languageChanged", onChange);
  }, []);

  // Memoized so the i18n context value stays referentially stable: the shared
  // I18nProvider builds `setLang` (and thus the whole context `value`) off
  // `onLangChange`. An inline function here would bust the memo on every
  // provider re-render and cascade re-renders through every useI18n() consumer
  // (the entire thread-playground tree). It only closes over the stable
  // `electrobun` module import, so `[]` deps are correct.
  const handleLangChange = useCallback((lang: Lang) => {
    void electrobun.rpc?.request.setLanguage({ language: lang });
  }, []);

  return (
    <I18nProvider
      initialLang={initialLang}
      onLangChange={handleLangChange}
    >
      {children}
    </I18nProvider>
  );
}
