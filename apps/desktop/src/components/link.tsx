"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";

import { useCommands } from "@/commands";

/**
 * An `<a>` that opens its `href` in the user's default browser via the
 * `openLink` command (which calls `Utils.openExternal` in the main process),
 * rather than navigating the webview. Accepts every native anchor prop; only
 * the click behaviour is overridden.
 */
export function Link({
  href,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { executeCommand } = useCommands();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || !href) return;
    // The OS opens the URL; the webview must not navigate to it.
    event.preventDefault();
    executeCommand({ type: "openLink", args: { url: href } });
  };

  return <a href={href} onClick={handleClick} {...props} />;
}
