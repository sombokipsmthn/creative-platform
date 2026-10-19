import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAuth, mockDb } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockDb: {
    query: {
      users: { findFirst: vi.fn() },
      clients: { findFirst: vi.fn(), findMany: vi.fn() },
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: { api: { getSession: mockAuth } },
}));

vi.mock("@/db", () => ({ db: mockDb }));

import { POST } from "./route";
import { DELETE, PATCH } from "./[id]/route";

const creator = { id: "creator-1" };

function request(url: string, method: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: { "content-type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

describe("client API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: creator.id },
      session: { id: "session-1" },
    });
    mockDb.query.users.findFirst.mockResolvedValue(creator);
  });

  it("rejects creation without a name before writing", async () => {
    const response = await POST(request("https://example.com/api/clients", "POST", { email: "client@example.com" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Client name is required" });
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("creates a client with all submitted details and authenticated creator", async () => {
    const created = {
      id: "client-1",
      creatorId: creator.id,
      name: "Jane Wanjiku",
      company: "Acme",
      email: "jane@example.com",
      phone: "+254 700 000 000",
      kraPin: "A000000000Z",
      location: "Nairobi",
      status: "active",
    };
    const returning = vi.fn().mockResolvedValue([created]);
    const values = vi.fn(() => ({ returning }));
    mockDb.insert.mockReturnValue({ values });

    const response = await POST(request("https://example.com/api/clients", "POST", {
      name: "  Jane Wanjiku  ",
      company: " Acme ",
      email: "jane@example.com",
      phone: "+254 700 000 000",
      kraPin: "A000000000Z",
      location: "Nairobi",
      notes: "Preferred contact by email",
    }));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(created);
    expect(values).toHaveBeenCalledWith(expect.objectContaining({
      creatorId: creator.id,
      name: "Jane Wanjiku",
      company: "Acme",
      phone: "+254 700 000 000",
      kraPin: "A000000000Z",
      location: "Nairobi",
    }));
  });

  it("updates editable details only for the authenticated creator", async () => {
    const existing = { id: "client-1", creatorId: creator.id, name: "Old Name" };
    const updated = { ...existing, name: "New Name", phone: "+44 20 0000 0000", company: "Updated Co", kraPin: "P000000000X" };
    mockDb.query.clients.findFirst.mockResolvedValue(existing);
    const returning = vi.fn().mockResolvedValue([updated]);
    const set = vi.fn(() => ({ where: vi.fn(() => ({ returning })) }));
    mockDb.update.mockReturnValue({ set });

    const response = await PATCH(
      request("https://example.com/api/clients/client-1", "PATCH", {
        name: "New Name",
        phone: "+44 20 0000 0000",
        company: "Updated Co",
        kraPin: "P000000000X",
        location: "London",
      }),
      { params: Promise.resolve({ id: "client-1" }) },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(updated);
    expect(set).toHaveBeenCalledWith(expect.objectContaining({
      name: "New Name",
      phone: "+44 20 0000 0000",
      company: "Updated Co",
      kraPin: "P000000000X",
      location: "London",
    }));
  });

  it("does not delete a client that is not owned by the authenticated creator", async () => {
    mockDb.query.clients.findFirst.mockResolvedValue(null);

    const response = await DELETE(
      request("https://example.com/api/clients/other-client", "DELETE"),
      { params: Promise.resolve({ id: "other-client" }) },
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Client not found." });
    expect(mockDb.transaction).toHaveBeenCalledTimes(1);
  });
});
