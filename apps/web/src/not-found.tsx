import { useI18n } from "@llm-space/ui/i18n";
import { Button } from "@llm-space/ui/ui/button";
import { ArrowRightIcon } from "lucide-react";

import { SiteHeader } from "@/components/site-header";

/**
 * Shown for a broken shared link (unknown connector / malformed path) and for a
 * thread that couldn't be loaded. Keeps the site header and guides the visitor
 * back to the landing page.
 */
export function NotFound({ message }: { message?: string }) {
  const { t } = useI18n();
  return (
    <div className="dark flex h-dvh flex-col bg-[#08080a] text-[#ededf0]">
      <SiteHeader />
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="space-y-2">
          <div className="text-sm font-medium tracking-widest text-neutral-500 uppercase">
            {t.viewer.notFound.eyebrow}
          </div>
          <h1 className="text-2xl font-semibold">
            {t.viewer.notFound.title}
          </h1>
          <p className="max-w-md text-sm text-neutral-400">
            {message ?? t.viewer.notFound.description}
          </p>
        </div>
        <Button asChild size="lg">
          <a href={import.meta.env.BASE_URL}>
            {t.viewer.notFound.backToLlmSpace}
            <ArrowRightIcon className="size-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
