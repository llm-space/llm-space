import { ModelProvider } from "@llm-space/ui/components/model-provider";
import { ThemeProvider } from "@llm-space/ui/components/theme-provider";
import { HostServicesProvider } from "@llm-space/ui/host";
import { TooltipProvider } from "@llm-space/ui/ui/tooltip";
import { useEffect, useState } from "react";

import { webHost, webModelClient } from "@/host/web-host";
import { ThreadViewer } from "@/thread-viewer";

/** Parse `#/thread/:user/:gistId` (user is cosmetic; the gist id is the key). */
function parseRoute(hash: string): { gistId: string } | null {
  const match = /^#\/thread\/[^/]+\/([^/?#]+)/.exec(hash);
  return match ? { gistId: match[1] } : null;
}

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return parseRoute(hash);
}

export function App() {
  const route = useHashRoute();
  return (
    <ThemeProvider>
      <ModelProvider client={webModelClient}>
        <HostServicesProvider value={webHost}>
          <TooltipProvider delayDuration={800}>
            {route ? (
              <ThreadViewer gistId={route.gistId} />
            ) : (
              <Home />
            )}
          </TooltipProvider>
        </HostServicesProvider>
      </ModelProvider>
    </ThemeProvider>
  );
}

function Home() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-2 px-6 text-center">
      <div className="text-sm font-medium">LLM Space — shared thread viewer</div>
      <div className="text-muted-foreground max-w-md text-xs">
        Open a shared link of the form{" "}
        <code>/llm-space/#/thread/&lt;user&gt;/&lt;gist-id&gt;</code> to view a
        thread read-only.
      </div>
    </div>
  );
}
