import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAuth, mockDb } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockDb: {
    query: {
      users: { findFirst: vi.fn() },
      clients: { findFirst: vi.fn() },
      projects: { findFirst: vi.fn() },
      studioEvents: { findFirst: vi.fn(), findMany: vi.fn() },
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: { api: { getSession: mockAuth } },
}));

vi.mock("@/db", () => ({ db: mockDb }));

import { DELETE, PATCH } from "@/app/api/calendar/events/[id]/route";
import { POST } from "@/app/api/calendar/events/route";

describe("studio calendar event routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "auth-1" } });
    mockDb.query.users.findFirst.mockResolvedValue({ id: "creator-1" });
  });

  it("rejects unauthenticated event creation", async () => {
    mockAuth.mockResolvedValue(null);
    const response = await POST(new Request("https://example.com/api/calendar/events", { method: "POST", body: "{}" }));
    expect(response.status).toBe(401);
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("rejects invalid and reversed event dates", async () => {
    const invalid = await POST(new Request("https://example.com/api/calendar/events", {
      method: "POST",
      body: JSON.stringify({ title: "Shoot", startsAt: "not-a-date" }),
    }));
    expect(invalid.status).toBe(400);

    const reversed = await POST(new Request("https://example.com/api/calendar/events", {
      method: "POST",
      body: JSON.stringify({ title: "Shoot", startsAt: "2026-02-02T10:00:00Z", endsAt: "2026-02-02T09:00:00Z" }),
    }));
    expect(reversed.status).toBe(400);
  });

  it("does not allow linking a client outside the creator scope", async () => {
    mockDb.query.clients.findFirst.mockResolvedValue(null);
    const response = await POST(new Request("https://example.com/api/calendar/events", {
      method: "POST",
      body: JSON.stringify({ title: "Shoot", startsAt: "2026-02-02T10:00:00Z", clientId: "other-client" }),
    }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Client not found" });
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("returns 404 when updating or deleting an event outside the creator scope", async () => {
    mockDb.query.studioEvents.findFirst.mockResolvedValue(null);
    const context = { params: Promise.resolve({ id: "event-other" }) };
    const patch = await PATCH(new Request("https://example.com/api/calendar/events/event-other", { method: "PATCH", body: "{}" }), context);
    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    });
    const del = await DELETE(new Request("https://example.com/api/calendar/events/event-other", { method: "DELETE" }), context);
    expect(patch.status).toBe(404);
    expect(del.status).toBe(404);
  });

  it("deletes only through the creator-scoped predicate", async () => {
    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "event-1" }]),
      }),
    });

    const response = await DELETE(new Request("https://example.com/api/calendar/events/event-1", { method: "DELETE" }), {
      params: Promise.resolve({ id: "event-1" }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ deleted: true, id: "event-1" });
    expect(mockDb.delete).toHaveBeenCalled();
  });
});
