export function getWindowChromeOptions(platform: NodeJS.Platform) {
  if (platform === "darwin") {
    return {
      titleBarStyle: "hiddenInset" as const,
      trafficLightOffset: { x: 2, y: 16 },
    };
  }
  return { titleBarStyle: "default" as const };
}
