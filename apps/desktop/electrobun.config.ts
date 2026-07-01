import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "LLM Space",
    identifier: "tech.deerflow.llm-space",
    version: "0.0.1",
  },
  build: {
    // Vite builds to dist/, we copy from there. `assets/` holds hashed,
    // import-ed assets; `images/` (and anything else under Vite's `public/`)
    // is referenced by absolute path (e.g. `/images/onboard.png`) and must be
    // copied too, or it 404s in a packaged build.
    copy: {
      "dist/index.html": "views/mainview/index.html",
      "dist/assets": "views/mainview/assets",
      "dist/images": "views/mainview/images",
    },
    // Ignore Vite output in watch mode — HMR handles view rebuilds separately
    watchIgnore: ["dist/**"],
    mac: {
      bundleCEF: false,
      icons: "icon.iconset",
    },
    linux: {
      bundleCEF: false,
    },
    win: {
      bundleCEF: false,
    },
  },
} satisfies ElectrobunConfig;
