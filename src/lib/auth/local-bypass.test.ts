import { describe, expect, it } from "vitest";
import { getLocalAuthBypassState } from "./local-bypass";

describe("getLocalAuthBypassState", () => {
  const enabledEnv = {
    NODE_ENV: "development",
    LOCAL_AUTH_BYPASS: "true",
  } as const;

  it("enables bypass only on loopback hosts in development with the flag set", () => {
    expect(
      getLocalAuthBypassState(
        new Request("http://localhost:3000/admin"),
        enabledEnv,
      ).enabled,
    ).toBe(true);
    expect(
      getLocalAuthBypassState(
        new Request("http://127.0.0.1:3000/admin"),
        enabledEnv,
      ).enabled,
    ).toBe(true);
  });

  it("rejects bypass on non-local hosts, outside development, or without the flag", () => {
    expect(
      getLocalAuthBypassState(
        new Request("https://example.com/admin"),
        enabledEnv,
      ).enabled,
    ).toBe(false);
    expect(
      getLocalAuthBypassState(new Request("http://localhost:3000/admin"), {
        NODE_ENV: "production",
        LOCAL_AUTH_BYPASS: "true",
      }).enabled,
    ).toBe(false);
    expect(
      getLocalAuthBypassState(new Request("http://localhost:3000/admin"), {
        NODE_ENV: "development",
        LOCAL_AUTH_BYPASS: "false",
      }).enabled,
    ).toBe(false);
  });
});
