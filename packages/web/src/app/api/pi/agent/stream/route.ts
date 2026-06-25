import {
  agentLoopContinue,
  type AgentMessage,
  type AgentTool,
} from "@earendil-works/pi-agent-core";
import type { Model, Message, Api, Tool } from "@earendil-works/pi-ai";
import type { ModelConfigParams } from "@llm-space/core";
import type { NextRequest } from "next/server";

function convertToLlm(messages: AgentMessage[]): Message[] {
  return messages.filter(
    (message) =>
      message.role === "user" ||
      message.role === "assistant" ||
      message.role === "toolResult"
  );
}

export async function POST(request: NextRequest) {
  const response = new Response();
  response.headers.set("Content-Type", "text/event-stream");
  const encoder = new TextEncoder();
  const args = (await request.json()) as {
    context: {
      systemPrompt: string;
      messages: Message[];
      tools: Tool[];
    };
    model: Model<Api>;
    config?: {
      model: ModelConfigParams;
    };
  };
  if (args.context.messages.length > 0) {
    const lastMessage =
      args.context.messages[args.context.messages.length - 1]!;
    // 最后一条消息必须是 userMessage
    if (lastMessage.role === "assistant") {
      throw new Error(
        "The last message must be a user message or a tool call result."
      );
    }
  }
  const agentStream = agentLoopContinue(
    {
      ...args.context,
      tools: _convertToAgentTools(args.context.tools, { stepByStep: true }),
    },
    {
      model: args.model,
      convertToLlm,
      maxTokens: args.config?.model?.maxTokens,
      temperature: args.config?.model?.temperature,
      reasoning:
        args.config?.model?.reasoning === "off"
          ? undefined
          : (args.config?.model?.reasoning ?? undefined),
    }
  );
  const responseStream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      const abortController = new AbortController();
      request.signal.addEventListener("abort", () => {
        try {
          abortController.abort();
        } catch {
          // Ignore errors
        }
        controller.close();
      });

      controller.enqueue(encoder.encode("data: [START]\n\n"));
      for await (const message of agentStream) {
        send(message);
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
    status: 200,
  });
}

function _convertToAgentTools(
  tools: Tool[],
  { stepByStep = true }: { stepByStep?: boolean } = {}
): AgentTool[] {
  return tools.map(
    (tool) =>
      ({
        name: tool.name,
        label: tool.name,
        description: tool.description,
        parameters: tool.parameters,
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        async execute(toolCallId, params) {
          if (stepByStep) {
            return Promise.resolve({
              terminate: true,
              content: [
                {
                  type: "text",
                  text: "",
                },
              ],
              details: undefined,
            });
          }
          return Promise.resolve({
            content: [
              {
                type: "text",
                text: "",
              },
            ],
            details: undefined,
          });
        },
      }) as AgentTool
  );
}
