import type { AgentEvent } from "@earendil-works/pi-agent-core";
import type { Api, KnownProvider, Model } from "@earendil-works/pi-ai";
import { getBuiltinModel } from "@earendil-works/pi-ai/providers/all";
import { parseServerSentEvents, type ServerSentEvent } from "parse-sse";

import type { ModelConfig } from "../types/models";
import type { ThreadContext } from "../types/threads";

import { convertToPiContext } from "./converters";

export async function* streamThread(
  args: { context: ThreadContext; model: ModelConfig },
  config: { signal?: AbortSignal; endpoint?: string } = {}
) {
  const model = _resolveModel(args.model);
  const context = convertToPiContext(args.context, model);
  if (context.messages.length > 0) {
    const lastMessage = context.messages[context.messages.length - 1]!;
    // 最后一条消息必须是 userMessage
    if (lastMessage.role === "assistant") {
      throw new Error(
        "The last message must be a user message or a tool call result."
      );
    }
  }
  const body = {
    model,
    config: {
      model: args.model.params,
    },
    context,
  };
  const res = await fetch(config.endpoint ?? "/api/pi/agent/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: config.signal,
  });
  if (!res.ok) {
    throw new Error(`Failed to stream thread: ${res.statusText}`);
  }
  const eventStream = parseServerSentEvents(
    res
  ) as unknown as AsyncIterable<ServerSentEvent>;
  for await (const chunk of eventStream) {
    if (chunk.data === "[START]" || chunk.data === "[DONE]") {
      // Ignore lifecycle events
    } else {
      const event = JSON.parse(chunk.data) as AgentEvent;
      yield event;
    }
  }
}

function _resolveModel(config: ModelConfig) {
  const model = getBuiltinModel(
    config.provider as KnownProvider,
    config.id as never
  );
  if (!model) {
    throw new Error(`Model ${config.provider}/${config.id} not found`);
  }
  return model as Model<Api>;
}
