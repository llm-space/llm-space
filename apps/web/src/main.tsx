import "@fontsource-variable/geist/index.css";
import "@fontsource-variable/geist-mono/index.css";
import {
  LOCAL_STORAGE_KEYS,
  writeLocalStorage,
} from "@llm-space/ui/lib/local-storage";
import "@llm-space/ui/styles/globals.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

import { App } from "@/app";
// Landing-page-only styles; imported after globals so its additive tokens/helpers
// layer on top without redefining the shared theme.
import "@/landing/index.css";

// This site is dark-only: pin the theme before React mounts so ThemeProvider
// resolves dark and there's no light first paint. There is no theme toggle.
writeLocalStorage(LOCAL_STORAGE_KEYS.theme, "dark");
document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
