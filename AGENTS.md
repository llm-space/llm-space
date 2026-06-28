## Introduction

A workbench for prompt and agent development — build, trace, debug, evaluate, and manage, all in one place.

## Tooling

Use **bun** for everything (`packageManager: bun@1.3`). Do not use npm/pnpm/yarn.

| Task | Command | Notes |
|---|---|---|
| Install deps | `bun install` | from repo root |
| Run web app | `bun dev` | in `packages/web` → `next dev --turbo` (http://localhost:3000) |
| Build web | `bun run build` | in `packages/web` |
| Lint | `bun lint .` | flat config at repo root; or `bun run lint` (next lint) in web |
| Typecheck | `bun run typecheck` | in `packages/web` → `bun run typecheck` |
| Add a dependency | `bun add <pkg>` | run inside the target package |
| Add a shadcn/ui component | `bunx --bun shadcn@latest add <component>` | run inside `packages/web` |
| Run a script from root | `bun --filter <pkg> <script>` | e.g. `bun --filter @llm-space/web dev` |

`packages/web` also has `bun run check`. There is **no test framework** configured.

Shared dependency versions live in the root `package.json` `catalog` (referenced as `"catalog:"`) — bump them there, not per-package.

## Architecture

Bun-workspace monorepo (`packages/*`). The two libraries have no build step — their TypeScript is consumed directly via the `exports` map.

- **`@llm-space/core`** — domain library. Exports from `src/index.ts`: `Thread`/`Message`/`ModelConfig`/tool types, converters to/from the `@earendil-works/pi-*` formats, the `streamThread()` SSE client, and the `reduceMessages()` streaming reducer. Consumed by `web` and other packages.
- **`@llm-space/web`** — Next.js 15 App Router app serving both the UI **and** its API routes.

### Data flow (the core loop)

UI action → Zustand `run()` → `streamThread()` (core) → **POST `/api/pi/agent/stream`** → `agentLoopContinue()` from `@earendil-works/pi-agent-core` → Server-Sent Events → `reduceMessages()` folds events into messages → Zustand → UI re-renders.

State is **in-memory only** (no DB/persistence) — a reload resets everything.

### Web app layout (`packages/web/src`)

- `app/layout.tsx` — server component; providers; theme is **forced to dark** via next-themes.
- `app/page.tsx` — client; renders the single feature, ThreadPlayground.
- `app/api/pi/` — route handlers: `agent/stream` (SSE), `models/[provider]`, `models/[provider]/[model]`.
- `stores/thread-store.ts` — Zustand store, provided via React context inside `<ThreadPlayground>`; consume with `useThreadStore(selector)` / `useThreadStoreActions()`.
- `components/thread-playground/` — main UI: resizable two-panel layout, drag-to-reorder messages (`@hello-pangea/dnd`), tool editor, thinking view, image content.
- `components/code-editor/` — CodeMirror wrapper.
- `components/ui/` + `lib/utils.ts` — generated shadcn/ui + the `cn()` helper. **Generated; don't hand-edit** (also ESLint-ignored).
- `styles/globals.css` — Tailwind v4 + OKLch design tokens.

## Conventions

- **TypeScript**: strict, ESNext, `moduleResolution: bundler`. In `web`, `@/*` maps to `./src/*`.
- **Layering**: `@llm-space/core` holds the shared **types/utils** (`./types`, root `.`) plus **server-side implementations** under `src/server/` exported via the `./server` entrypoint (e.g. the local-filesystem storage backend in `server/storage/local/`). `web` consumes these: `app/api/` route handlers wrap the core server implementations to expose them over HTTP, and client-side HTTP callers live under `packages/web/src/client/`.
- **Prettier**: 2-space indent, double quotes, semicolons, es5 trailing commas, tailwind class sorting (`prettier-plugin-tailwindcss`).
