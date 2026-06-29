import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import { ModelProviderGroup } from "@llm-space/core";
import { Toaster } from "sonner";

import { AppHeader } from "@/components/app-header";
import { ModelProvider } from "@/components/model-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { electrobun } from "@/lib/electrobun";
import "@/styles/globals.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ModelProvider fetcher={fetchModels}>
      <TooltipProvider delayDuration={1000}>
        <div className="bg-background flex size-full flex-col">
          <Toaster theme="dark" position="top-center" offset={28} />
          <AppHeader />
          <main className="min-h-0 flex-1">{children}</main>
        </div>
      </TooltipProvider>
    </ModelProvider>
  );
}

async function fetchModels(): Promise<ModelProviderGroup[]> {
  if (!electrobun.rpc) {
    throw new Error("Electrobun RPC is not initialized");
  }
  const models = await electrobun.rpc.request.availableModels({});
  return models;
}
