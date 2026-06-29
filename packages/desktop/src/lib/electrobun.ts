import { Electroview } from "electrobun/view";

import type { DesktopRPCType } from "../shared/rpc";

const rpc = Electroview.defineRPC<DesktopRPCType>({
  handlers: { requests: {}, messages: {} },
});

export const electrobun = new Electroview({ rpc });
