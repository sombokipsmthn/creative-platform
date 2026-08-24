import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockHeaders, mockDb, verifyMock } = vi.hoisted(() => ({
  mockHeaders: {
    get: vi.fn(),
  },
  mockDb: {
    insert: vi.fn(),
    delete: vi.fn(),
  },
  verifyMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => mockHeaders),
}));

vi.mock("svix", () => ({
  Webhook: class {
    verify = verifyMock;
  },
}));

vi.mock("@/db", () => ({
  db: mockDb,
}));

import { POST } from "./route";

describe("POST /api/webhooks/clerk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_WEBHOOK_SECRET = "wh_test_secret";
    mockHeaders.get.mockImplementation((key: string) => {
      const values: Record<string, string> = {
        "svix-id": "svix_123",
        "svix-timestamp": "1710000000",
        "svix-signature": "valid-signature",
      };
      return values[key] ?? null;
    });
  });

  it("syncs the user record for a valid user.created event", async () => {
    const event = {
      type: "user.created",
      data: {
        id: "user_123",
        email_addresses: [
          { id: "email_1", email_address: "creator@example.com" },
        ],
        primary_email_address_id: "email_1",
        first_name: "Creator",
        last_name: "User",
        username: null,
      },
    };

    verifyMock.mockReturnValue(event);
    mockDb.insert.mockReturnValue({
      values: vi.fn(() => ({
        onConflictDoUpdate: vi.fn(() => Promise.resolve()),
      })),
    });

    const response = await POST(
      new Request("https://example.com/api/webhooks/clerk", {
        method: "POST",
        body: "{\"type\":\"user.created\"}",
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      synced: true,
    });
    expect(mockDb.insert).toHaveBeenCalled();
    expect(verifyMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        "svix-id": "svix_123",
        "svix-timestamp": "1710000000",
        "svix-signature": "valid-signature",
      })
    );
  });

  it("rejects invalid webhook signatures", async () => {
    mockHeaders.get.mockImplementation((key: string) => {
      const values: Record<string, string> = {
        "svix-id": "svix_123",
        "svix-timestamp": "1710000000",
        "svix-signature": "bad-signature",
      };
      return values[key] ?? null;
    });
    verifyMock.mockImplementation(() => {
      throw new Error("bad signature");
    });

    const response = await POST(
      new Request("https://example.com/api/webhooks/clerk", {
        method: "POST",
        body: "{\"type\":\"user.created\"}",
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid webhook signature" });
  });

  it("deletes the local user record for user.deleted events", async () => {
    const event = {
      type: "user.deleted",
      data: { id: "user_456" },
    };

    verifyMock.mockReturnValue(event);
    mockDb.delete.mockReturnValue({
      where: vi.fn(() => Promise.resolve()),
    });

    const response = await POST(
      new Request("https://example.com/api/webhooks/clerk", {
        method: "POST",
        body: "{\"type\":\"user.deleted\"}",
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      deleted: true,
    });
    expect(mockDb.delete).toHaveBeenCalled();
  });
});
