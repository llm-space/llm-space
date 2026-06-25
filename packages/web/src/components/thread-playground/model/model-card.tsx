import type { Api, Model } from "@earendil-works/pi-ai";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

function formatTokenCount(value: number) {
  return value.toLocaleString();
}

function formatCostPerMillion(value: number) {
  return `$${value.toFixed(2)}/M`;
}

function ModelCardField({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 border-t py-3 text-xs first-of-type:border-t-0",
        className
      )}
    >
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="min-w-0 text-right font-mono tabular-nums">{value}</span>
    </div>
  );
}

function BoolValue({ value }: { value: boolean }) {
  return (
    <span className={value ? "" : "text-muted-foreground"}>
      {value ? "Supported" : "Not supported"}
    </span>
  );
}

export function ModelCard({
  model,
  className,
}: {
  model: Model<Api>;
  className?: string;
}) {
  const supportsImageInput = model.input.includes("image");

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <main className="flex flex-col">
        <ModelCardField label="Model" value={model.id} />
        <ModelCardField label="Provider" value={model.provider} />
        <ModelCardField label="API type" value={model.api} />
        <ModelCardField
          label="Base URL"
          value={<span className="break-all text-left">{model.baseUrl}</span>}
        />
        <ModelCardField
          label="Context window"
          value={formatTokenCount(model.contextWindow)}
        />
        <ModelCardField
          label="Max tokens"
          value={formatTokenCount(model.maxTokens)}
        />
        <ModelCardField
          label="Reasoning"
          value={<BoolValue value={model.reasoning} />}
        />
        <ModelCardField
          label="Image input"
          value={<BoolValue value={supportsImageInput} />}
        />
        <ModelCardField
          label="Input cost"
          value={formatCostPerMillion(model.cost.input)}
        />
        <ModelCardField
          label="Output cost"
          value={formatCostPerMillion(model.cost.output)}
        />
      </main>
    </div>
  );
}
