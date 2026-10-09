import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAuth, mockDb } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockDb: {
    select: vi.fn(),
    insert: vi.fn(),
    query: { users: { findFirst: vi.fn() } },
  },
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: { api: { getSession: mockAuth } },
}));

vi.mock("@/db", () => ({
  db: mockDb,
}));

import { POST } from "./route";

describe("POST /api/users/sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user_123", email: "creator@example.com", name: "Creator", emailVerified: true, image: null }, session: { id: "session_1" } });
  });

  it("creates a database record for a authenticated user when one does not exist", async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([]),
        })),
      })),
    });

    mockDb.insert.mockReturnValue({
      values: vi.fn(() => ({
        onConflictDoNothing: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([{
            id: "user_123",
            email: "creator@example.com",
            name: "Creator",
            onboardingStatus: "incomplete",
            onboardingStep: 1,
          }]),
        })),
      })),
    });

    const request = new Request("http://localhost/api/users/sync");
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      needsOnboarding: true,
      user: expect.objectContaining({ id: "user_123" }),
      profile: null,
    });
  });

  it("returns the existing user and does not create a duplicate record", async () => {
    const existingUser = {
      id: "db_user_2",
      userId: "user_123",
      email: "creator@example.com",
      name: "Creator",
    };

    mockDb.select
      .mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue([existingUser]),
          })),
        })),
      })
      .mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue([]),
          })),
        })),
      });

    const request = new Request("http://localhost/api/users/sync");
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      needsOnboarding: true,
      user: existingUser,
      profile: null,
    });
  });

  it("rejects a request that lacks a Better Auth session user id", async () => {
    mockAuth.mockResolvedValue(null);

    const request = new Request("http://localhost/api/users/sync");
    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });
});
