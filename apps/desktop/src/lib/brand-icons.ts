import { modelMappings, providerMappings } from "@lobehub/icons";
import type { CSSProperties, ComponentType } from "react";

/** The subset of props our avatars pass to a resolved brand icon component. */
export type BrandIconComponent = ComponentType<{
  size?: number;
  className?: string;
  style?: CSSProperties;
}>;

/**
 * A resolved brand icon: the React component to render (colored variant when the
 * brand ships one, else the base monochrome icon that inherits the current text
 * color) plus any default props the mapping carries.
 */
export interface BrandIcon {
  Icon: BrandIconComponent;
  props?: Record<string, unknown>;
}

/**
 * Builtin provider ids whose `@lobehub/icons` keyword differs from their id and
 * display name, so auto-resolution would otherwise miss them. Used as an extra
 * resolution candidate for builtin providers; a user's explicit `icon` override
 * still takes precedence. Providers with no lobehub icon (e.g. xiaomi) are
 * omitted and fall back to the initials avatar.
 */
export const PROVIDER_ICON_ALIASES: Record<string, string> = {
  "amazon-bedrock": "bedrock",
  "ant-ling": "antgroup",
  ark: "volcengine",
  "ark-coding-plan": "volcengine",
  "azure-openai-responses": "azure",
  "minimax-cn": "minimax",
  moonshotai: "moonshot",
  "moonshotai-cn": "moonshot",
  "openai-codex": "openai",
  "vercel-ai-gateway": "vercel",
  zai: "zhipu",
  "zai-coding-cn": "zhipu",
};

/**
 * Build a {@link BrandIcon} from a mapping entry. The library types its icons as
 * `FC<... & any>`, so we cast through `unknown` to our narrow prop shape and
 * prefer the colored variant when present.
 */
function toBrandIcon(item: {
  Icon: { Color?: unknown };
  props?: unknown;
}): BrandIcon {
  const icon = item.Icon as {
    Color?: BrandIconComponent;
  } & BrandIconComponent;
  return {
    Icon: icon.Color ?? icon,
    props: item.props as Record<string, unknown> | undefined,
  };
}

// Keyword patterns come from a small, static vocabulary but are tested against
// every candidate on every avatar resolve, so compile each pattern once and
// reuse it. `null` marks a keyword that isn't a valid regex (matched by literal
// equality instead).
const _keywordRegexCache = new Map<string, RegExp | null>();

function matchesKeyword(keyword: string, value: string): boolean {
  // Model keywords are regexes; provider keywords are plain strings — a plain
  // string is a valid (literal) regex, so one path covers both. Fall back to a
  // case-insensitive equality check when a keyword isn't a valid pattern.
  let regex = _keywordRegexCache.get(keyword);
  if (regex === undefined) {
    try {
      regex = new RegExp(keyword, "i");
    } catch {
      regex = null;
    }
    _keywordRegexCache.set(keyword, regex);
  }
  return regex
    ? regex.test(value)
    : keyword.toLowerCase() === value.toLowerCase();
}

/**
 * Resolve a provider brand icon from the first matching candidate. Provider
 * mappings match on an exact (case-insensitive) keyword, mirroring
 * `@lobehub/icons`' own `ProviderIcon`. Returns `null` when nothing matches so
 * callers can fall back to their own placeholder.
 */
export function resolveProviderIcon(
  ...candidates: (string | undefined)[]
): BrandIcon | null {
  for (const candidate of candidates) {
    const key = candidate?.trim().toLowerCase();
    if (!key) continue;
    for (const item of providerMappings) {
      if (item.keywords.some((keyword) => keyword.toLowerCase() === key)) {
        return toBrandIcon(item);
      }
    }
  }
  return null;
}

/**
 * Resolve a model brand icon from the first matching candidate. Model mappings
 * match via a case-insensitive regex over the model string (so an id like
 * `gpt-4o-mini` resolves to the GPT icon). Falls back to a provider brand icon —
 * a custom model with no model-specific mapping can still show its provider's
 * logo (e.g. `deepseek-v4` → DeepSeek). Returns `null` when nothing matches.
 */
export function resolveModelIcon(
  ...candidates: (string | undefined)[]
): BrandIcon | null {
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value) continue;
    for (const item of modelMappings) {
      if (item.keywords.some((keyword) => matchesKeyword(keyword, value))) {
        return toBrandIcon(item);
      }
    }
  }
  return resolveProviderIcon(...candidates);
}
