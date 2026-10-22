import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAuth, mockDb } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockDb: {
    query: {
      users: {
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

import { GET } from "./route";
import { clients, contracts, galleries, invoices, projects, quotes } from "@/db/schema";

describe("GET /api/badge-counts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "auth-user", email: "creator@example.com" },
      session: { id: "session-1" },
    });
    mockDb.query.users.findFirst.mockResolvedValue({
      id: "creator-1",
      userId: "auth-user",
    });

    const counts = new Map<unknown, number>([
      [galleries, 3],
      [quotes, 4],
      [invoices, 5],
      [contracts, 6],
      [clients, 7],
      [projects, 8],
    ]);

    mockDb.select.mockImplementation(() => ({
      from: vi.fn((table) => ({
        where: vi.fn().mockResolvedValue([{ count: counts.get(table) ?? 0 }]),
      })),
    }));
  });

  it("returns counts for actual creator-owned records", async () => {
    const response = await GET(new Request("https://example.com/api/badge-counts"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      "/admin/quotes": 4,
      "/admin/invoices": 5,
      "/admin/galleries": 3,
      "/admin/contracts": 6,
      "/admin/clients": 7,
      "/admin/projects": 8,
      "/admin/settings": 0,
    });
  });

  it("does not query contract templates", async () => {
    await GET(new Request("https://example.com/api/badge-counts"));

    expect(mockDb.select).toHaveBeenCalledTimes(6);
    const queriedTables = mockDb.select.mock.results.map((result) => {
      const from = result.value.from as ReturnType<typeof vi.fn>;
      return from.mock.calls[0]?.[0];
    });

    expect(queriedTables).toContain(contracts);
    expect(queriedTables).not.toContainEqual(expect.objectContaining({ name: "contract_templates" }));
  });

  it("returns unauthorized when there is no authenticated creator", async () => {
    mockAuth.mockResolvedValue(null);

    const response = await GET(new Request("https://example.com/api/badge-counts"));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    expect(mockDb.select).not.toHaveBeenCalled();
  });
});
