import { describe, expect, it, vi } from "vitest";

const { mockAuth, mockDb } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockDb: {
    query: { users: { findFirst: vi.fn() } },
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/lib/auth/auth", () => ({ auth: { api: { getSession: mockAuth } } }));
vi.mock("@/db", () => ({ db: mockDb }));

import { GET, POST, PATCH, DELETE } from "@/app/api/watermark-presets/route";

describe("watermark preset API", () => {
  it("rejects unauthenticated reads", async () => {
    mockAuth.mockResolvedValue(null);
    const response = await GET(new Request("https://example.com/api/watermark-presets"));
    expect(response.status).toBe(401);
  });

  it("rejects invalid preset names before database writes", async () => {
    mockAuth.mockResolvedValue({ user: { id: "creator-1" }, session: { id: "session-1" } });
    mockDb.query.users.findFirst.mockResolvedValue({ id: "creator-1" });
    const response = await POST(new Request("https://example.com/api/watermark-presets", {
      method: "POST", body: JSON.stringify({ name: "" }), headers: { "content-type": "application/json" },
    }));
    expect(response.status).toBe(400);
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("rejects updates without an id", async () => {
    mockAuth.mockResolvedValue({ user: { id: "creator-1" }, session: { id: "session-1" } });
    mockDb.query.users.findFirst.mockResolvedValue({ id: "creator-1" });
    const response = await PATCH(new Request("https://example.com/api/watermark-presets", {
      method: "PATCH", body: JSON.stringify({ name: "Proof" }), headers: { "content-type": "application/json" },
    }));
    expect(response.status).toBe(400);
    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it("requires an id for deletion", async () => {
    mockAuth.mockResolvedValue({ user: { id: "creator-1" }, session: { id: "session-1" } });
    mockDb.query.users.findFirst.mockResolvedValue({ id: "creator-1" });
    const response = await DELETE(new Request("https://example.com/api/watermark-presets", {
      method: "DELETE", body: JSON.stringify({}), headers: { "content-type": "application/json" },
    }));
    expect(response.status).toBe(400);
    expect(mockDb.delete).not.toHaveBeenCalled();
  });
});
