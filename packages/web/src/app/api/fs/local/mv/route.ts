import { requireString, route } from "@/server/api";
import { localFs } from "@/server/storage";

export const POST = route(async (req) => {
  const { src, dest } = (await req.json()) as { src?: unknown; dest?: unknown };
  await localFs.mv(requireString(src, "src"), requireString(dest, "dest"));
});
