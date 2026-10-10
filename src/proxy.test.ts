import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

import customMiddleware from "@/proxy";
import { getLocalAuthBypassState } from "@/lib/auth/local-bypass";

function request(url: string) {
  return new Request(url);
}

function status(response: Response) {
  return response.status;
}

describe("local authentication bypass state", () => {
  it("exposes safe server-side diagnostics without exposing the flag value", () => {
    expect(getLocalAuthBypassState(request("http://localhost:3005/admin"), {
      NODE_ENV: "development",
      LOCAL_AUTH_BYPASS: "true",
    })).toEqual({
      enabled: true,
      nodeEnv: "development",
      flagConfigured: true,
      hostname: "localhost",
      localHostname: true,
    });
  });

});

describe("proxy local authentication bypass", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("LOCAL_AUTH_BYPASS", "true");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(null)));
  });

  it.each([
    "http://localhost:3005/admin",
    "http://localhost:3005/admin/projects",
    "http://127.0.0.1:3015/admin",
  ])("allows protected local navigation without a session: %s", async (url) => {
    const response = await customMiddleware(request(url));

    expect(status(response)).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("local-auth-bypass=1");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("redirects when the bypass flag is disabled", async () => {
    vi.stubEnv("LOCAL_AUTH_BYPASS", "false");

    const response = await customMiddleware(request("http://localhost:3005/admin"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3005/sign-in?redirect=%2Fadmin");
    expect(response.headers.get("set-cookie")).toContain("local-auth-bypass");
    expect(fetch).toHaveBeenCalledWith(
      new URL("/api/auth/get-session", "http://localhost:3005"),
      expect.objectContaining({
        headers: { cookie: "" },
        cache: "no-store",
      }),
    );
  });

  it("redirects remote hostnames even when the flag is enabled", async () => {
    const response = await customMiddleware(request("https://creative-platform.example/admin"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://creative-platform.example/sign-in?redirect=%2Fadmin");
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("redirects localhost in production even when the flag is enabled", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_URL", "creative-platform.example");

    const response = await customMiddleware(request("http://localhost:3005/admin"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3005/sign-in?redirect=%2Fadmin");
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("does not bypass API routes", async () => {
    const response = await customMiddleware(request("http://localhost:3005/api/dashboard/stats"));

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("allows protected navigation when the auth route returns a valid session", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_URL", "creative-platform.example");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      Response.json({ user: { id: "user-1" }, session: { id: "session-1" } }),
    ));

    const response = await customMiddleware(new Request("https://creative-platform.example/admin", {
      headers: { cookie: "session_token=abc" },
    }));

    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledWith(
      new URL("/api/auth/get-session", "https://creative-platform.example"),
      expect.objectContaining({
        headers: { cookie: "session_token=abc" },
        cache: "no-store",
      }),
    );
  });

  it("fails closed when the auth route cannot be reached", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_URL", "creative-platform.example");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connection failed")));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await customMiddleware(new Request("https://creative-platform.example/admin"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://creative-platform.example/sign-in?redirect=%2Fadmin");
    expect(consoleError).toHaveBeenCalledOnce();
  });
});
