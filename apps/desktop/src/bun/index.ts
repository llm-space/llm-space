/* eslint-disable import-x/order -- load order is load-bearing: `./env/hydrate`
   must resolve the real login-shell environment (API keys, PATH) before any
   other module reads `process.env`. GUI launches don't inherit it. */
import "./env/hydrate";
// Seed a fresh workspace (before `./app` pulls in storage/RPC).
import "./workspace/seed";
import "./app";
/* eslint-enable import-x/order */
