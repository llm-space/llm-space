import { BrowserView } from "electrobun/bun";

import type { DesktopRPCType } from "../../shared/rpc";
import { getAvailableModelGroups } from "../models";

export const mainWindowRPC = BrowserView.defineRPC<DesktopRPCType>({
  maxRequestTime: 10_000,
  handlers: {
    requests: {
      availableModels: () => getAvailableModelGroups(),
    },
    messages: {},
  },
});
