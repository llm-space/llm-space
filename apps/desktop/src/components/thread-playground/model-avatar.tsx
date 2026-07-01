import { extractInitials } from "@llm-space/core";

import { cn } from "@/lib/utils";

export function ModelAvatar({
  id,
  name,
  size = 24,
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
        "text-foreground/90 flex items-center justify-center rounded-full border-b bg-cover bg-no-repeat pt-0.5 text-xs text-shadow-2xs",
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
