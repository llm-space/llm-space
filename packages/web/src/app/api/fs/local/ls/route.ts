import { requireString, route } from "@/server/api";
import { localFs } from "@/server/storage";

export const POST = route(async (req) => {
  const { path } = (await req.json()) as { path?: unknown };
  return localFs.ls(requireString(path, "path"));
});
