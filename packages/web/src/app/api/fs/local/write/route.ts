import type { Thread } from "@llm-space/core";

import { requireString, route } from "@/server/api";
import { localFs } from "@/server/storage";

export const POST = route(async (req) => {
  const { path, thread } = (await req.json()) as {
    path?: unknown;
    thread?: Thread;
  };
  await localFs.write(requireString(path, "path"), thread!);
});
