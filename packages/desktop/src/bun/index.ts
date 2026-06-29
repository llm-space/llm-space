import { BrowserWindow, Updater } from "electrobun/bun";

import "./app/menu";
import { mainWindowRPC } from "./rpc";

const DEV_SERVER_PORT = 5173;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;

// Check if Vite dev server is running for HMR
async function getMainViewUrl(): Promise<string> {
  const channel = await Updater.localInfo.channel();
  if (channel === "dev") {
    try {
      await fetch(DEV_SERVER_URL, { method: "HEAD" });
      console.info(`HMR enabled: Using Vite dev server at ${DEV_SERVER_URL}`);
      return DEV_SERVER_URL;
    } catch {
      console.info(
        "Vite dev server not running. Run 'bun run dev:hmr' for HMR support."
      );
    }
  }
  return "views://mainview/index.html";
}

// Create the main application window
const url = await getMainViewUrl();

new BrowserWindow({
  title: "LLM Space",
  url,
  titleBarStyle: "hiddenInset",
  rpc: mainWindowRPC,
  trafficLightOffset: {
    x: 2,
    y: 2,
  },
  frame: {
    width: 1024,
    height: 720,
    x: 200,
    y: 200,
  },
});
