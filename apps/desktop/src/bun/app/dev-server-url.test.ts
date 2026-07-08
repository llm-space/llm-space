import { describe, expect, test } from "bun:test";

import { getDevServerUrl } from "./dev-server-url";

describe("getDevServerUrl", () => {
  test("matches the Vite HMR loopback host", () => {
    expect(getDevServerUrl(undefined)).toBe("http://127.0.0.1:5173");
    expect(getDevServerUrl("5180")).toBe("http://127.0.0.1:5180");
  });
});
