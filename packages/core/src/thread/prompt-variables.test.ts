import { describe, expect, test } from "bun:test";

import type { ThreadContext } from "../types";

import { renderThreadPromptVariables } from "./prompt-variables";

function context(systemPrompt: string, extra?: Partial<ThreadContext>) {
  return {
    systemPrompt,
    variableVariants: {
      active: "default",
      variants: { default: { greeting: "Hi" } },
    },
    ...extra,
  } as ThreadContext;
}

const file = (value: string) => () => Promise.resolve(value);

describe("renderThreadPromptVariables — dispatcher", () => {
  test("simple path substitutes known vars and leaves unknown literal", async () => {
    const { context: out } = await renderThreadPromptVariables({
      context: context("{{ greeting }} {{ stray }}"),
    });
    expect(out.systemPrompt).toBe("Hi {{ stray }}");
  });

  test("template path renders logic + @include + known vars", async () => {
    const { context: out } = await renderThreadPromptVariables({
      context: context('{% if true %}{{ greeting }}-{{@include("f.md")}}{% endif %}'),
      loadFile: file("INC"),
    });
    expect(out.systemPrompt).toBe("Hi-INC");
  });

  test("malformed template falls back to the original text (silent)", async () => {
    const src = "{% for x in y %}broken";
    const { context: out } = await renderThreadPromptVariables({
      context: context(src),
    });
    expect(out.systemPrompt).toBe(src);
  });
});

describe("renderThreadPromptVariables — template output freeze", () => {
  test("frozen output survives a changed file across re-runs", async () => {
    const base = context('{{@include("f.md")}}');

    const first = await renderThreadPromptVariables({
      context: base,
      loadFile: file("V1"),
    });
    expect(first.context.systemPrompt).toBe("V1");

    // Re-run with the prior snapshot: the place is frozen even though the file
    // now reads differently.
    const second = await renderThreadPromptVariables({
      context: { ...base, snapshot: first.snapshot },
      loadFile: file("V2"),
    });
    expect(second.context.systemPrompt).toBe("V1");
  });

  test("no prior snapshot re-renders with the new file (edit path)", async () => {
    const base = context('{{@include("f.md")}}');
    const fresh = await renderThreadPromptVariables({
      context: base,
      loadFile: file("V2"),
    });
    expect(fresh.context.systemPrompt).toBe("V2");
  });
});
