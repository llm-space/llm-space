import type { KnownProvider } from "@earendil-works/pi-ai";
import { getBuiltinModel } from "@earendil-works/pi-ai/providers/all";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ provider: string; model: string }> }
) {
  const { provider, model } = await ctx.params;
  const result = getBuiltinModel(provider as KnownProvider, model as never);
  if (result) {
    return Response.json(result);
  } else {
    return new Response(`Model "${provider}/${model}" not found`, {
      status: 404,
    });
  }
}
