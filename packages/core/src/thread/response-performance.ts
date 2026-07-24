import type { AssistantMessageTiming, ModelUsage } from "../types";

/**
 * Output-token throughput after the first token arrives.
 *
 * Time to first token is intentionally excluded from the generation window:
 * output tokens / (`durationMs` - `firstTokenMs`).
 */
export function outputTokensPerSecond(
  usage: ModelUsage | null | undefined,
  timing: AssistantMessageTiming | null | undefined
): number | null {
  if (
    !usage ||
    timing?.firstTokenMs === undefined ||
    usage.output <= 0
  ) {
    return null;
  }
  const generationMs = timing.durationMs - timing.firstTokenMs;
  if (!Number.isFinite(generationMs) || generationMs <= 0) {
    return null;
  }
  return usage.output / (generationMs / 1000);
}
