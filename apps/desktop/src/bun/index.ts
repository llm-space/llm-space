/* eslint-disable import-x/order -- load order is load-bearing: `./env/hydrate`
   must resolve the real login-shell environment (API keys, PATH) before any
   other module reads `process.env`. GUI launches don't inherit it. */
import "./env/hydrate";
// Seed a fresh workspace (before `./app` pulls in storage/RPC).
import "./workspace/seed";
import "./app";
import { analytics } from "./analytics";
/* eslint-enable import-x/order */

// Anonymous launch signal, and a best-effort flush so queued events aren't lost
// when the app exits. See `shared/analytics.ts` for the privacy contract.
analytics.capture("app_opened", { platform: process.platform });

for (const signal of ["SIGINT", "SIGTERM", "beforeExit"] as const) {
  process.once(signal, () => {
    void analytics.shutdown();
  });
}
