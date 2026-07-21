import { describe, expect, test } from "bun:test";

import { getWindowChromeOptions } from "./window-options";

describe("getWindowChromeOptions", () => {
  test("keeps the inset title bar and traffic lights on macOS", () => {
    expect(getWindowChromeOptions("darwin")).toEqual({
      titleBarStyle: "hiddenInset",
      trafficLightOffset: { x: 2, y: 16 },
    });
  });

  test.each(["win32", "linux"] as const)(
    "uses native title-bar behavior on %s",
    (platform) => {
      expect(getWindowChromeOptions(platform)).toEqual({
        titleBarStyle: "default",
      });
    }
  );
});
