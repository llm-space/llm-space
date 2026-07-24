import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { AgentEvent, AgentTransport } from "@llm-space/core";

import { createThreadStore } from "./thread-store";

const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

beforeAll(() => {
  globalThis.requestAnimationFrame = (callback) =>
    setTimeout(() => callback(performance.now()), 0);
  globalThis.cancelAnimationFrame = (handle) => clearTimeout(handle);
});

afterAll(() => {
  globalThis.requestAnimationFrame = originalRequestAnimationFrame;
  globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
});

function _event(value: unknown): AgentEvent {
  return value as AgentEvent;
}

describe("assistant message timing", () => {
  test("records first non-empty model delta and completed duration", async () => {
    const events = [
      _event({
        type: "message_start",
        message: { role: "assistant" },
      }),
      _event({
        type: "message_update",
        assistantMessageEvent: { type: "text_start", contentIndex: 0 },
      }),
      _event({
        type: "message_update",
        assistantMessageEvent: {
          type: "text_delta",
          contentIndex: 0,
          delta: "Hello",
        },
      }),
      _event({
        type: "message_end",
        message: { role: "assistant" },
      }),
    ];
    const transport: AgentTransport = async function* () {
      yield* events;
    };
    const clock = [100, 350, 600, 900, 1600];
    const store = createThreadStore(
      {
        context: {
          messages: [
            {
              id: "user-1",
              role: "user",
              content: [{ type: "text", text: "Hi" }],
            },
          ],
        },
      },
      {
        transport,
        resolveModel: () => ({ provider: "test", id: "test" }),
        now: () => clock.shift() ?? 1600,
      }
    );

    await store.getState().run();

    const messages = store.getState().thread.context?.messages ?? [];
    const assistant = messages.at(-1);
    expect(assistant?.role).toBe("assistant");
    if (assistant?.role !== "assistant") {
      throw new Error("Expected an assistant message");
    }
    expect(assistant.timing).toEqual({
      firstTokenMs: 800,
      durationMs: 1500,
    });
    expect(store.getState().runHistory[0]?.thread.context?.messages?.at(-1)).toEqual(
      assistant
    );
  });
});
