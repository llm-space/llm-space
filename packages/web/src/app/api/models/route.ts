import type { ModelProviderGroup } from "@/lib/model-types";
import { availableModels } from "@/lib/models";

export function GET() {
  const providers = availableModels.getProviders();
  const groups: ModelProviderGroup[] = providers.map((provider) => ({
    id: provider.id,
    name: provider.name,
    models: provider.getModels(),
  }));
  return Response.json(groups);
}
