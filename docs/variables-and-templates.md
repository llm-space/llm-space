# Variables and Templates

Variables and templates let you keep prompts DRY and dynamic: pull out content that changes or is reused, reference it by name, and add logic such as conditionals, loops, and file includes. Everything here works in every text surface — the **System Prompt**, **messages**, and **tool results** — and the stored Thread template stays untouched; substitution happens only at run time.

> This page builds on the [Variables](./core-concepts.md#variables) section in Core Concepts. Read that first for the basics of `{{variable_name}}`.

# Variables (recap)

You write `{{variable_name}}` in the text, and at run time LLM Space replaces it with the variable's value.

- **Built-in variables** compute their value automatically: `{{current_date}}` and `{{available_skills}}`.
- **Custom variables** are a `name → value` text pair you define once and reuse anywhere.
- A variable name must start with a letter or underscore and contain only letters, digits, and underscores.
- Any `{{...}}` that isn't a known variable is **left untouched**, so arbitrary braces in tool or web-search results are never mangled.

# Templates

On top of plain variables, LLM Space supports a **Jinja2-style template language** (powered by Nunjucks). This adds macros (starting with `@include`), conditionals, and loops, so you can assemble a prompt from smaller pieces and adapt it to context.

## When a template is rendered

To keep untrusted tool output safe, template rendering only kicks in for text that contains a **block tag** `{% … %}` or the **macro form** `{{@ … }}`. Text that only contains plain `{{variable}}` placeholders (or unrelated braces) uses the simpler variable substitution and is never parsed as a template.

If a template can't be parsed (for example a stray `{%` inside a pasted tool result, or a missing `{% endfor %}`), that text is **left unchanged** — a broken template never fails your run.

## The `@include` macro

`@include` inlines the contents of a file into your prompt:

```text
{{@include("~/notes/writing-style.md")}}
```

- The path may be **any absolute path**, and a leading `~` expands to your home directory.
- If the file doesn't exist (or can't be read), it is replaced with an **empty string** — no error.
- The included content is **rendered recursively**: it can itself use `{{variables}}`, control flow, and even nested `@include` (bounded by a depth limit to prevent cycles).

**Editor autocomplete:** in any prompt editor, type `{{` and pick **`@include`** from the suggestions (it appears alongside the variables) — or type `{{@`. The app inserts `@include("path/to/your/file")` with the placeholder path **selected**, so you can type the real path right away.

## Conditionals

```text
{% if company_name %}
You represent {{company_name}}.
{% elif region %}
Operate under {{region}} guidelines.
{% else %}
Use the default policy.
{% endif %}
```

An empty or missing value is falsy, so `{% if company_name %}` is a handy way to include a block only when a custom variable is set.

## Loops

```text
{% for item in ["research", "draft", "review"] %}
{{ loop.index }}. {{ item }}
{% endfor %}
```

Inside a loop, `loop.index` (1-based), `loop.index0` (0-based), `loop.first`, `loop.last`, and `loop.length` are available. Because custom variables are plain text, lists for `{% for %}` typically come from a literal list like above or from an included file.

## Using variables inside templates

Defined variables (built-in and custom) are available by name inside templates, and unknown names stay literal:

```text
{% if true %}Today is {{current_date}}. {{unknown_name}}{% endif %}
```

renders to something like `Today is 2026-07-20. {{unknown_name}}` — the known variable is resolved, and the unknown placeholder is preserved verbatim.

## A fuller example

```text
{{@include("~/prompts/persona.md")}}

## Task
{% if audience %}Write for: {{audience}}.{% else %}Write for a general audience.{% endif %}

## Checklist
{% for step in ["outline", "draft", "cite sources", "proofread"] %}
- [ ] {{ loop.index }}. {{ step }}
{% endfor %}

Current date: {{current_date}}
```

# Editor support

The prompt editors (System Prompt, messages, and tool results) understand template syntax:

- **Highlighting** — `{{variable}}` placeholders are highlighted in amber, and `{% … %}` tags in violet, so template structure stands out from the surrounding text. Highlighting is purely syntactic; it never validates names.
- **Variable / `@include` completion** — type `{{` to get a list of the available variables plus **`@include`**. Selecting `@include` inserts `@include("path/to/your/file")` with the placeholder path selected, ready to type over. (Typing `{{@` narrows straight to `@include`.)
- **Tag completion** — type `{%` to get the block tags: `if`, `elif`, `else`, `endif`, `for`, `endfor`, `set`, `raw`, `endraw`. Each inserts a complete `{% … %}` tag with the cursor placed where you continue typing (for example `{% for ‸ in  %}`).

# Rendering, storage, and run history

- Substitution runs at **run time**; the saved Thread keeps the original `{{...}}` and `{% ... %}` source.
- Once a message or tool result has been run, its rendered output is **frozen for that run's history**, so replays and comparisons stay byte-stable even if an included file or the clock later changes. Editing the source text re-renders it on the next run.
- In the display-only web viewer there is no filesystem, so `@include` resolves to an empty string.

# Tips

- Keep reusable blocks (personas, tone-of-voice, shared constraints) in Markdown files and pull them in with `@include`, or store short snippets as custom variables.
- Use `{% if %}` on a custom variable to toggle optional sections without maintaining multiple prompts.
- If a template surface renders unexpectedly as plain text, check that its tags are balanced — an unparseable template silently falls back to the original text.

---

See also:

- [Core Concepts › Variables](./core-concepts.md#variables)
- [Quick Start](./get-started.md)
- [Settings › Skills](./settings.md)
