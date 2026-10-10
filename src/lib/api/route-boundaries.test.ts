import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const { mockAuth, mockDb } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockDb: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
      clients: {
        findFirst: vi.fn(),
      },
    },
    select: vi.fn(),
  },
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: { api: { getSession: mockAuth } },
}));

vi.mock("@/db", () => ({
  db: mockDb,
}));

import { withCreatorApi, ApiError } from "@/lib/api/route-boundaries";

describe("withCreatorApi authorization boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 when the request is unauthenticated (no authenticated user)", async () => {
    mockAuth.mockResolvedValue(null);

    const req = new Request("https://example.com/api/test");
    const handler = vi.fn();

    const response = await withCreatorApi(req, handler);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("returns 401 when the authenticated user has no local creator account", async () => {
    mockAuth.mockResolvedValue({ user: { id: "auth_unknown", email: "unknown@example.com" }, session: { id: "session_1" } });
    mockDb.query.users.findFirst.mockResolvedValue(null);

    const req = new Request("https://example.com/api/test");
    const handler = vi.fn();

    const response = await withCreatorApi(req, handler);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("allows access and passes authenticated user when creator exists", async () => {
    mockAuth.mockResolvedValue({ user: { id: "auth_123", email: "creator@example.com" }, session: { id: "session_1" } });
    mockDb.query.users.findFirst.mockResolvedValue({
      id: "creator_abc",
      userId: "auth_123",
    });

    const req = new Request("https://example.com/api/test");
    const handler = vi.fn().mockResolvedValue({ success: true });

    const response = await withCreatorApi(req, handler);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(handler).toHaveBeenCalledWith(
      req,
      expect.objectContaining({ id: "creator_abc", userId: "auth_123" })
    );
  });

  it("handles custom ApiError with correct status code", async () => {
    mockAuth.mockResolvedValue({ user: { id: "auth_123", email: "creator@example.com" }, session: { id: "session_1" } });
    mockDb.query.users.findFirst.mockResolvedValue({
      id: "creator_abc",
      userId: "auth_123",
    });

    const req = new Request("https://example.com/api/test");
    const handler = vi.fn().mockRejectedValue(new ApiError("Forbidden resource", 403));

    const response = await withCreatorApi(req, handler);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Forbidden resource" });
  });

  it("handles unexpected server errors with 500 without leaking stack traces", async () => {
    mockAuth.mockResolvedValue({ user: { id: "auth_123", email: "creator@example.com" }, session: { id: "session_1" } });
    mockDb.query.users.findFirst.mockResolvedValue({
      id: "creator_abc",
      userId: "auth_123",
    });

    const req = new Request("https://example.com/api/test");
    const handler = vi.fn().mockRejectedValue(new Error("Database connection lost"));

    const response = await withCreatorApi(req, handler);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBeDefined();
    // Verify no stack trace leaked
    expect(body.stack).toBeUndefined();
  });

  it("logs safe database diagnostics without exposing database details to clients", async () => {
    mockAuth.mockResolvedValue({ user: { id: "auth_123" }, session: { id: "session_1" } });
    mockDb.query.users.findFirst.mockResolvedValue({ id: "auth_123" });
    const diagnostic = Object.assign(new Error("private connection detail"), {
      code: "42P01",
      table: "galleries",
    });
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const req = new Request("https://example.com/api/badge-counts");

    const response = await withCreatorApi(
      req,
      vi.fn().mockRejectedValue(diagnostic)
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Internal server error" });
    expect(log).toHaveBeenCalledWith(
      "Unexpected API failure",
      expect.objectContaining({
        path: "/api/badge-counts",
        code: "42P01",
        table: "galleries",
      })
    );
  });
});
