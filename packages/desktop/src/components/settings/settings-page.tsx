import type { ReactNode } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/**
 * Shared layout for a single settings page: a sticky title header followed by a
 * scrollable body. Each concrete page (General, Models, …) renders its own
 * controls into `children`.
 */
export function SettingsPage({
  title,
  children,
  className,
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-12 shrink-0 items-center px-6">
        <h2 className="font-heading text-base font-medium">{title}</h2>
      </header>
      <ScrollArea className="min-h-0 flex-1">
        <div className={cn("px-6 pb-6", className)}>{children}</div>
      </ScrollArea>
    </div>
  );
}
