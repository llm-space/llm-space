/// <reference types="vite/client" />

// Bun-side `import md from "./x.md" with { type: "text" }` — the markdown file's
// raw text. (Renderer `*.md?raw` imports are typed by `vite/client`.)
declare module "*.md" {
  const content: string;
  export default content;
}
