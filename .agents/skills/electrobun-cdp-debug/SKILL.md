---
name: electrobun-cdp-debug
description: Debug the LLM Space desktop Electrobun renderer through CEF Chrome DevTools Protocol. Use when inspecting the real desktop page DOM, visible text, runtime state, console output, screenshots, or interactions; use instead of mocking electrobun.rpc in a normal browser.
---

# Electrobun CDP Debug

Use this skill to inspect the actual desktop renderer. Do not mock
`electrobun.rpc` in a browser when the user asks to debug the Electrobun page.

## Start The App

From the repo root:

```sh
bun run dev:cef
```

This runs the desktop app with CEF and opens CDP on `127.0.0.1:9333`.
If the port is busy:

```sh
LLM_SPACE_DESKTOP_CDP_PORT=9334 bun run dev:cef
```

Normal `bun dev` keeps the native WebView renderer and does not expose CDP.

## Inspect Page State

Use the bundled probe from the repo root:

```sh
bun run .agents/skills/electrobun-cdp-debug/scripts/cdp-probe.mjs
```

Common variants:

```sh
bun run .agents/skills/electrobun-cdp-debug/scripts/cdp-probe.mjs --screenshot /tmp/llm-space-cef.png
bun run .agents/skills/electrobun-cdp-debug/scripts/cdp-probe.mjs --eval 'document.body.innerText.slice(0, 2000)'
bun run .agents/skills/electrobun-cdp-debug/scripts/cdp-probe.mjs --console-ms 3000
bun run .agents/skills/electrobun-cdp-debug/scripts/cdp-probe.mjs --port 9334
```

The script connects to `/json/list`, picks the `LLM Space` page target when
present, evaluates in the page context, and prints JSON.

## Interaction Guidance

Prefer semantic DOM operations through `Runtime.evaluate`, for example clicking a
button found by text, role, icon class, or nearby content. Use
`Input.dispatchMouseEvent` / `Input.dispatchKeyEvent` only when native coordinate
behavior matters.

For screenshots, use the probe's `--screenshot` option or CDP
`Page.captureScreenshot`. Show the saved image to the user when visual layout is
part of the task.
