import type { KnownProvider } from "@earendil-works/pi-ai";
import { getBuiltinModels } from "@earendil-works/pi-ai/providers/all";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ provider: string }> }
) {
  const provider = (await ctx.params).provider;
  return Response.json(getBuiltinModels(provider as KnownProvider));
}
