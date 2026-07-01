import { uuid, type AgentEvent, type AgentTransport } from "@llm-space/core";

import { electrobun } from "@/lib/electrobun";
import type { StreamThreadResponsePayload } from "@/shared/rpc";

const ABORT_ERROR = () =>
  new DOMException("The operation was aborted.", "AbortError");

/**
 * An {@link AgentTransport} backed by Electrobun RPC. It sends the prepared
 * request as a `sendStreamThreadRequest` message and bridges the incoming
 * `receiveStreamThreadResponse` messages into an async iterator of events.
 */
export function createRpcTransport(): AgentTransport {
  return async function* rpcTransport(request, { signal }) {
    const rpc = electrobun.rpc;
    if (!rpc) {
      throw new Error("Electrobun RPC is not initialized");
    }

    const streamId = uuid();
    const events: AgentEvent[] = [];
    let wake: (() => void) | null = null;
    let finished = false;
    let aborted = false;
    let errorMessage: string | null = null;
    const notify = () => {
      wake?.();
      wake = null;
    };

    const onResponse = (message: StreamThreadResponsePayload) => {
      if (message.streamId !== streamId) {
        return;
      }
      if (message.type === "event") {
        events.push(message.event);
      } else if (message.type === "done") {
        finished = true;
      } else {
        errorMessage = message.message;
        finished = true;
      }
      notify();
    };

    const onAbort = () => {
      rpc.send.abortStreamThread({ streamId });
      aborted = true;
      finished = true;
      notify();
    };

    if (signal?.aborted) {
      throw ABORT_ERROR();
    }

    rpc.addMessageListener("receiveStreamThreadResponse", onResponse);
    signal?.addEventListener("abort", onAbort, { once: true });

    try {
      rpc.send.sendStreamThreadRequest({ streamId, request });
      while (true) {
        while (events.length > 0) {
          yield events.shift()!;
        }
        if (aborted) {
          throw ABORT_ERROR();
        }
        if (errorMessage !== null) {
          throw new Error(errorMessage);
        }
        if (finished) {
          return;
        }
        await new Promise<void>((resolve) => {
          wake = resolve;
        });
      }
    } finally {
      rpc.removeMessageListener("receiveStreamThreadResponse", onResponse);
      signal?.removeEventListener("abort", onAbort);
      // Consumer stopped early (break / downstream error) without an abort
      // signal — make sure the bun side tears the stream down too.
      if (!finished) {
        rpc.send.abortStreamThread({ streamId });
      }
    }
  };
}
