import type * as pi from "@earendil-works/pi-ai";

export type ModelProviderGroup = {
  id: string;
  name: string;
  models: readonly pi.Model<pi.Api>[];
};
