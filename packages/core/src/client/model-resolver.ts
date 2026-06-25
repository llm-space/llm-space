import * as pi from "@earendil-works/pi-ai";
import { getBuiltinModel } from "@earendil-works/pi-ai/providers/all";

import type { ModelConfig } from "../types/models";

export function resolveModel(
  model: Pick<ModelConfig, "id" | "provider">
): pi.Model<pi.Api> | null {
  const provider = getBuiltinModel(
    model.provider as pi.KnownProvider,
    model.id as never
  );
  return provider ?? null;
}
