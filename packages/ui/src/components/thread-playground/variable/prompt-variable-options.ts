import type {
  PromptDateVariableFormat,
  PromptSkillsVariableFormat,
} from "@llm-space/core/thread";

import type { Messages } from "../../../i18n";

/**
 * A selectable format option for a built-in variable. `labelKey` is the
 * `t.thread.variable.<labelKey>` catalog key resolved at render time so the
 * option list is locale-aware without rebuilding the arrays.
 */
interface PromptVariableFormatOption<T extends string> {
  value: T;
  labelKey: keyof Messages["thread"]["variable"];
}

export const PROMPT_DATE_FORMATS: readonly PromptVariableFormatOption<PromptDateVariableFormat>[] =
  [
    { value: "readable-date", labelKey: "formatReadableDate" },
    { value: "iso-date", labelKey: "formatIsoDate" },
    { value: "local-date-time", labelKey: "formatLocalDateTime" },
  ];

export const PROMPT_SKILLS_FORMATS: readonly PromptVariableFormatOption<PromptSkillsVariableFormat>[] =
  [
    { value: "xml", labelKey: "formatXml" },
    { value: "markdown-list", labelKey: "formatMarkdownList" },
  ];

export const PROMPT_SKILLS_INDENTS = [0, 2, 4] as const;

/**
 * Resolve an option's display label from the i18n catalog. Falls back to the
 * raw `labelKey` (then the value) if the catalog entry is missing — only
 * happens if the catalog and option list drift out of sync.
 */
export function resolveVariableOptionLabel<
  T extends string,
  O extends { value: T; labelKey: keyof Messages["thread"]["variable"] },
>(t: Messages, option: O): string {
  const group = t.thread.variable;
  return group[option.labelKey] ?? option.labelKey ?? option.value;
}
