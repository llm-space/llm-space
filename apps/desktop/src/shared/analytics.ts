/**
 * The analytics event contract, shared by both runtime contexts.
 *
 * Privacy contract — this is a local-first LLM workbench, so telemetry is
 * strictly **anonymous, behaviour-only**:
 * - identified by a random per-install id, never a user identity;
 * - event properties describe *what kind of action* happened, never its
 *   content. No prompt text, message bodies, system prompts, file contents,
 *   API keys, base URLs, or headers ever appear here.
 *
 * Every event funnels through the bun main process (`bun/analytics`), which is
 * the single, auditable network egress. Renderer-only events reach it over the
 * `captureAnalyticsEvent` RPC message; bun-side events call `analytics.capture`
 * directly.
 */
export interface AnalyticsEventMap {
  /** The desktop app finished booting. */
  app_opened: { platform: NodeJS.Platform };
  /**
   * A single agent run finished. Carries only anonymous shape/outcome metadata —
   * the model selector, the run outcome, and coarse counts. Never any content.
   */
  thread_run: {
    provider: string;
    model: string;
    outcome: "completed" | "error" | "aborted";
    durationMs: number;
    messageCount: number;
    toolCount: number;
    hasSystemPrompt: boolean;
  };
  /** The user configured a model provider. */
  provider_added: { providerId: string; kind: "builtin" | "custom" };
  /** The user added an MCP server. */
  mcp_server_added: Record<string, never>;
  /** The user opened the settings dialog. */
  settings_opened: Record<string, never>;
  /** The user made a choice on the first-run onboarding screen. */
  onboarding_choice: { choice: string };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

/**
 * User-controlled analytics preference, persisted to `settings/analytics.json`
 * alongside the anonymous install id. `enabled` is the opt-*out* switch surfaced
 * in Settings; it defaults to on but is always subordinate to the hard gates
 * (no `POSTHOG_KEY`, or `LLM_SPACE_ANALYTICS_DISABLED`), which force telemetry
 * off regardless.
 */
export interface AnalyticsSettings {
  enabled: boolean;
}

export const DEFAULT_ANALYTICS_SETTINGS: AnalyticsSettings = { enabled: true };

/** A single, self-describing analytics event: a name plus its typed payload. */
export type AnalyticsEvent = {
  [K in AnalyticsEventName]: { event: K; properties: AnalyticsEventMap[K] };
}[AnalyticsEventName];
