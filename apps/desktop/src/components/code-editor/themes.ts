import { basicLightInit } from "@uiw/codemirror-theme-basic";
import { monokaiInit } from "@uiw/codemirror-theme-monokai";

export const dark = monokaiInit({
  settings: {
    background: "var(--textarea)",
    gutterBackground: "transparent",
    gutterForeground: "#555",
    gutterActiveForeground: "#FFF",
    fontSize: "var(--text-sm)",
  },
});

export const light = basicLightInit({
  settings: {
    fontSize: "var(--text-sm)",
  },
});
