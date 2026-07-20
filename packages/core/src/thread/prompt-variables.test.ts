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

describe("renderThreadPromptVariables — JSON variables", () => {
  const jsonContext = (systemPrompt: string, value: string) =>
    context(systemPrompt, { variables: { data: { type: "json", value } } });

  test("field access and iteration in templates", async () => {
    const { context: out } = await renderThreadPromptVariables({
      context: jsonContext(
        "{% for i in data.items %}{{ i }}{% endfor %}|{{ data.user.name }}",
        '{"user":{"name":"Ada"},"items":["a","b"]}'
      ),
    });
    expect(out.systemPrompt).toBe("ab|Ada");
  });

  test("whole object renders as pretty JSON on the simple path", async () => {
    const { context: out } = await renderThreadPromptVariables({
      context: jsonContext("{{ data }}", '{"n":1}'),
    });
    expect(out.systemPrompt).toBe('{\n  "n": 1\n}');
  });

  test("invalid JSON leaves field access empty", async () => {
    const { context: out } = await renderThreadPromptVariables({
      context: jsonContext("[{{ data.x }}]", "{bad"),
    });
    expect(out.systemPrompt).toBe("[]");
  });
});

describe("renderThreadPromptVariables — file variables", () => {
  const fileContext = (systemPrompt: string, value: string) =>
    context(systemPrompt, { variables: { doc: { type: "file", value } } });

  test("inlines the file's contents", async () => {
    const { context: out } = await renderThreadPromptVariables({
      context: fileContext("[{{ doc }}]", "notes.md"),
      loadFile: (p) => Promise.resolve(p === "notes.md" ? "HELLO" : ""),
    });
    expect(out.systemPrompt).toBe("[HELLO]");
  });

  test("missing file inlines empty", async () => {
    const { context: out } = await renderThreadPromptVariables({
      context: fileContext("[{{ doc }}]", "missing.md"),
      loadFile: () => Promise.resolve(""),
    });
    expect(out.systemPrompt).toBe("[]");
  });

  test("empty path leaves the placeholder literal", async () => {
    const { context: out } = await renderThreadPromptVariables({
      context: fileContext("[{{ doc }}]", ""),
      loadFile: () => Promise.resolve("SHOULD NOT BE READ"),
    });
    expect(out.systemPrompt).toBe("[{{ doc }}]");
  });
});
