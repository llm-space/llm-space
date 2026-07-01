#!/usr/bin/env bun
/* global Bun */

const DEFAULT_EVALUATION = `(() => ({
  title: document.title,
  href: location.href,
  text: document.body.innerText.slice(0, 1000),
  hasElectrobun: typeof globalThis.__electrobun !== "undefined"
    || typeof globalThis.electrobun !== "undefined",
  buttons: [...document.querySelectorAll("button")].slice(0, 20).map((button, index) => ({
    index,
    text: button.innerText,
    ariaLabel: button.getAttribute("aria-label"),
    title: button.getAttribute("title"),
    svgClass: button.querySelector("svg")?.getAttribute("class") ?? null,
    rect: (() => {
      const rect = button.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })(),
  })),
}))()`;

const args = Bun.argv.slice(2);

if (hasFlag("--help")) {
  console.info(`Usage: bun run .agents/skills/electrobun-cdp-debug/scripts/cdp-probe.mjs [options]

Options:
  --port <port>          CDP port. Defaults to LLM_SPACE_DESKTOP_CDP_PORT or 9333.
  --target <text>        Target title or URL substring. Defaults to "LLM Space".
  --eval <expression>    JavaScript expression to evaluate in the page.
  --screenshot <path>    Save a PNG screenshot to this path.
  --console-ms <ms>      Collect console events for this many milliseconds.
  --help                Show this help.
`);
  process.exit(0);
}

const port = readFlag("--port", Bun.env.LLM_SPACE_DESKTOP_CDP_PORT ?? "9333");
const targetText = readFlag("--target", "LLM Space");
const expression = readFlag("--eval", DEFAULT_EVALUATION);
const screenshotPath = readFlag("--screenshot", null);
const consoleMs = Number(readFlag("--console-ms", "0"));

const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(
  (response) => {
    if (!response.ok) {
      throw new Error(`CDP target list failed: ${response.status}`);
    }
    return response.json();
  }
);

const target =
  targets.find(
    (candidate) =>
      candidate.type === "page" &&
      (candidate.title?.includes(targetText) || candidate.url?.includes(targetText))
  ) ?? targets.find((candidate) => candidate.type === "page");

if (!target?.webSocketDebuggerUrl) {
  throw new Error(`No CDP page target found on port ${port}`);
}

const ws = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
const consoleEvents = [];
let nextId = 1;

ws.onmessage = (event) => {
  const message = JSON.parse(String(event.data));
  if (message.method === "Runtime.consoleAPICalled") {
    consoleEvents.push({
      type: message.params.type,
      args: message.params.args.map((arg) => arg.value ?? arg.description ?? arg.type),
      timestamp: message.params.timestamp,
    });
    return;
  }

  const resolve = pending.get(message.id);
  if (!resolve) return;
  pending.delete(message.id);
  resolve(message);
};

await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});

await send("Runtime.enable");
await send("Page.enable");

if (consoleMs > 0) {
  await sleep(consoleMs);
}

const evaluation = await send("Runtime.evaluate", {
  expression,
  returnByValue: true,
  awaitPromise: true,
});

if (evaluation.error || evaluation.result.exceptionDetails) {
  ws.close();
  throw new Error(JSON.stringify(evaluation.error ?? evaluation.result.exceptionDetails));
}

let screenshot = null;
if (screenshotPath) {
  const captured = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
  });
  await Bun.write(screenshotPath, Buffer.from(captured.result.data, "base64"));
  screenshot = screenshotPath;
}

ws.close();

console.info(
  JSON.stringify(
    {
      target: {
        title: target.title,
        url: target.url,
        id: target.id,
      },
      value: evaluation.result.result.value,
      console: consoleEvents,
      screenshot,
    },
    null,
    2
  )
);

function send(method, params = {}) {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve) => pending.set(id, resolve));
}

function hasFlag(name) {
  return args.includes(name);
}

function readFlag(name, fallback) {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${name} requires a value`);
  }
  return value;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
