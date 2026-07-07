"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";

import { useCommands } from "@/commands";
import type { Command } from "@/shared/commands";

/**
 * An `<a>` that opens its `href` in the user's default browser via the
 * `openLink` command (which calls `Utils.openExternal` in the main process),
 * rather than navigating the webview. Pass `command` to run a different command
 * on click instead (e.g. opening a local folder). Accepts every native anchor
 * prop; only the click behaviour is overridden.
 */
export function Link({
  href,
  onClick,
  command,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** When set, click dispatches this command instead of `openLink`. */
  command?: Command;
}) {
  const { executeCommand } = useCommands();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    // The OS opens the URL or path; the webview must not navigate to it.
    event.preventDefault();
    if (command) {
      executeCommand(command);
      return;
    }
    if (!href) return;
    executeCommand({ type: "openLink", args: { url: href } });
  };

  return <a href={href ?? "#"} onClick={handleClick} {...props} />;
}
