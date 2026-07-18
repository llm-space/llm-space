import type { ModelConfig } from "@llm-space/core";
import type { ReactNode } from "react";

import { cn } from "@llm-space/ui/lib/utils";

import { useI18n } from "../../../i18n";
import { useModel, useModels } from "../../model-provider";

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
  const { t } = useI18n();
  return (
    <span className={value ? "" : "text-muted-foreground"}>
      {value ? t.thread.model.supported : t.thread.model.notSupported}
    </span>
  );
}

export function ModelCard({
  model,
  className,
}: {
  model: ModelConfig | null;
  className?: string;
}) {
  const providers = useModels();
  const { t } = useI18n();
  const resolvedModel = useModel({
    id: model?.id ?? "",
    provider: model?.provider ?? "",
  });
  if (!resolvedModel) {
    return null;
  }
  const providerName =
    providers.find((group) => group.id === resolvedModel.provider)?.name ??
    resolvedModel.provider;
  const supportsImageInput = resolvedModel.input.includes("image");
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <main className="flex flex-col">
        <ModelCardField label={t.thread.model.modelLabel} value={resolvedModel.id} />
        <ModelCardField label={t.thread.model.providerLabel} value={providerName} />
        <ModelCardField label={t.thread.model.apiTypeLabel} value={resolvedModel?.api} />
        <ModelCardField
          label={t.thread.model.baseUrlLabel}
          value={
            <span className="text-left break-all">{resolvedModel.baseUrl}</span>
          }
        />
        <ModelCardField
          label={t.thread.model.contextWindowLabel}
          value={formatTokenCount(resolvedModel.contextWindow)}
        />
        <ModelCardField
          label={t.thread.model.maxTokensLabel}
          value={formatTokenCount(resolvedModel.maxTokens)}
        />
        <ModelCardField
          label={t.thread.model.reasoningLabel}
          value={<BoolValue value={resolvedModel.reasoning} />}
        />
        <ModelCardField
          label={t.thread.model.imageInputLabel}
          value={<BoolValue value={supportsImageInput} />}
        />
        <ModelCardField
          label={t.thread.model.inputCostLabel}
          value={formatCostPerMillion(resolvedModel.cost.input)}
        />
        <ModelCardField
          label={t.thread.model.outputCostLabel}
          value={formatCostPerMillion(resolvedModel.cost.output)}
        />
      </main>
    </div>
  );
}
