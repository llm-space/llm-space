import {
  I18nProvider as SharedI18nProvider,
  LANGUAGES,
  useI18n as useSharedI18n,
  type Lang as SharedLang,
  type Messages,
} from "@llm-space/ui/i18n";
import { type ReactNode } from "react";

// Re-export the shared language list + type so landing consumers keep working.
export { LANGUAGES };
export type Lang = SharedLang;

// The landing page's message tree is the `landing` area of the shared catalog.
// Landing components consume `t.hero.*`, `t.nav.*`, etc. directly, so this
// wrapper exposes that area as `t` for a drop-in replacement of the old API.
type LandingMessages = Messages["landing"];

interface LandingI18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: LandingMessages;
}

/** The landing-page i18n hook — delegates to the shared provider. */
export function useI18n(): LandingI18nValue {
  const { lang, setLang, t } = useSharedI18n();
  return { lang, setLang, t: t.landing };
}

/**
 * Landing-page provider. Thin wrapper over the shared `@llm-space/ui` provider
 * so the landing, shared-thread viewer, and not-found page all render from one
 * catalog. localStorage (`llm-space-lang`) is the web persistence seam.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  return <SharedI18nProvider>{children}</SharedI18nProvider>;
}
