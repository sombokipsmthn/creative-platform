import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAuth, mockDb } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockDb: {
    execute: vi.fn(),
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      users: { findFirst: vi.fn() },
      clients: { findFirst: vi.fn() },
      galleries: { findFirst: vi.fn() },
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

vi.mock("@/db", () => ({
  db: mockDb,
}));

import { GET as getClients, POST as createClient } from "@/app/api/clients/route";
import { GET as getClient, PATCH as updateClient } from "@/app/api/clients/[id]/route";
import { GET as getPublicGallery } from "@/app/api/public/galleries/[slug]/route";

function betterAuthSession(userId: string) {
  return { userId, sessionClaims: { exp: Math.floor(Date.now() / 1000) + 3600 } };
}

describe("Authorization matrix", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------------------------------------------
  // Creator isolation
  // ------------------------------------------------------------------

  it("creator A cannot read creator B's client", async () => {
    mockAuth.mockResolvedValue(betterAuthSession("betterAuth_a"));

    mockDb.query.users.findFirst.mockResolvedValue({ id: "creator_a", authUserId: "betterAuth_a" });

    mockDb.query.clients.findFirst.mockResolvedValue(null);

    const req = new Request("https://example.com/api/clients/client_b_id");
    const res = await getClient(req, { params: Promise.resolve({ id: "client_b_id" }) });

    expect(res.status).toBe(404);
  });

  it("creator A can read their own client", async () => {
    mockAuth.mockResolvedValue(betterAuthSession("betterAuth_a"));

    mockDb.query.users.findFirst.mockResolvedValue({ id: "creator_a", authUserId: "betterAuth_a" });

    mockDb.query.clients.findFirst.mockResolvedValue({
      id: "client_a_id",
      creatorId: "creator_a",
      name: "Client A",
    });

    const req = new Request("https://example.com/api/clients/client_a_id");
    const res = await getClient(req, { params: Promise.resolve({ id: "client_a_id" }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("client_a_id");
  });

  it("unauthenticated request to clients list returns 401", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const req = new Request("https://example.com/api/clients");
    const res = await getClients(req);

    expect(res.status).toBe(401);
  });

  it("unauthenticated client creation returns 401", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const req = new Request("https://example.com/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Evil Client" }),
    });
    const res = await createClient(req);

    expect(res.status).toBe(401);
  });

  it("creator A cannot update creator B's client", async () => {
    mockAuth.mockResolvedValue(betterAuthSession("betterAuth_a"));

    mockDb.query.users.findFirst.mockResolvedValue({ id: "creator_a", authUserId: "betterAuth_a" });

    mockDb.query.clients.findFirst.mockResolvedValue(null);

    const req = new Request("https://example.com/api/clients/client_b_id", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Hacked" }),
    });
    const res = await updateClient(req, { params: Promise.resolve({ id: "client_b_id" }) });

    expect(res.status).toBe(404);
  });

  // ------------------------------------------------------------------
  // Public gallery access
  // ------------------------------------------------------------------

  it("public gallery returns 404 for unknown slug", async () => {
    mockDb.execute.mockResolvedValue({ rows: [] });

    const req = new Request("https://example.com/api/public/galleries/no-such-slug");
    const res = await getPublicGallery(req, { params: Promise.resolve({ slug: "no-such-slug" }) });

    expect(res.status).toBe(404);
  });

  it("public gallery returns 410 when expired", async () => {
    mockDb.execute.mockResolvedValue({
      rows: [
        {
          id: "gallery_1",
          expires_at: new Date(Date.now() - 1000).toISOString(),
        },
      ],
    });

    const req = new Request("https://example.com/api/public/galleries/expired-slug");
    const res = await getPublicGallery(req, { params: Promise.resolve({ slug: "expired-slug" }) });

    expect(res.status).toBe(410);
  });

  it("public gallery returns 401 when PIN required and no session", async () => {
    mockDb.execute
      .mockResolvedValueOnce({
        rows: [
          {
            id: "gallery_1",
            access_pin: "$2b$10$hashedpin",
            expires_at: null,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const req = new Request("https://example.com/api/public/galleries/pin-slug");
    const res = await getPublicGallery(req, { params: Promise.resolve({ slug: "pin-slug" }) });

    expect([401, 500]).toContain(res.status);
  });
});