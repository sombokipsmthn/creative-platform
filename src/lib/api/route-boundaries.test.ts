import { describe, expect, it, vi, beforeEach } from "vitest";

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

vi.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth,
}));

vi.mock("@/db", () => ({
  db: mockDb,
}));

import { withCreatorApi, ApiError } from "@/lib/api/route-boundaries";

describe("withCreatorApi authorization boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the request is unauthenticated (no Clerk user)", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const req = new Request("https://example.com/api/test");
    const handler = vi.fn();

    const response = await withCreatorApi(req, handler);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("returns 401 when the Clerk user has no local creator account", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_unknown" });
    mockDb.query.users.findFirst.mockResolvedValue(null);

    const req = new Request("https://example.com/api/test");
    const handler = vi.fn();

    const response = await withCreatorApi(req, handler);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("allows access and passes authenticated user when creator exists", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_123" });
    mockDb.query.users.findFirst.mockResolvedValue({
      id: "creator_abc",
      authUserId: "clerk_123",
    });

    const req = new Request("https://example.com/api/test");
    const handler = vi.fn().mockResolvedValue({ success: true });

    const response = await withCreatorApi(req, handler);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(handler).toHaveBeenCalledWith(
      req,
      expect.objectContaining({ id: "creator_abc", authUserId: "clerk_123" })
    );
  });

  it("handles custom ApiError with correct status code", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_123" });
    mockDb.query.users.findFirst.mockResolvedValue({
      id: "creator_abc",
      authUserId: "clerk_123",
    });

    const req = new Request("https://example.com/api/test");
    const handler = vi.fn().mockRejectedValue(new ApiError("Forbidden resource", 403));

    const response = await withCreatorApi(req, handler);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Forbidden resource" });
  });

  it("handles unexpected server errors with 500 without leaking stack traces", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_123" });
    mockDb.query.users.findFirst.mockResolvedValue({
      id: "creator_abc",
      authUserId: "clerk_123",
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
});
