import { extractInitials } from "@llm-space/core";

import { cn } from "@/lib/utils";

export function ProviderAvatar({
  id,
  name,
  size = 18,
  className,
}: {
  id: string;
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-foreground/80 flex shrink-0 items-center justify-center rounded-md border-b bg-cover bg-no-repeat pt-0.5 text-[9px] text-shadow-2xs",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(https://avatar.vercel.sh/${encodeURIComponent(id)}?size=${size})`,
      }}
    >
      {extractInitials(name)}
    </div>
  );
}
