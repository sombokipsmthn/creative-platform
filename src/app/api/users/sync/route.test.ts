import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAuth, mockCurrentUser, mockDb } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockCurrentUser: vi.fn(),
  mockDb: {
    select: vi.fn(),
  },
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth,
  currentUser: mockCurrentUser,
}));

vi.mock("@/db", () => ({
  db: mockDb,
}));

import { POST } from "./route";

describe("POST /api/users/sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: "user_123" });
  });

  it("creates a database record for a Clerk user when one does not exist", async () => {
    mockCurrentUser.mockResolvedValue({
      emailAddresses: [{ emailAddress: "creator@example.com" }],
      firstName: "Creator",
      lastName: null,
    });
    mockDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([]),
        })),
      })),
    });

    const response = await POST();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      needsOnboarding: true,
      user: null,
      profile: null,
    });
  });

  it("returns the existing user and does not create a duplicate record", async () => {
    const existingUser = {
      id: "db_user_2",
      authUserId: "user_123",
      email: "creator@example.com",
      name: "Creator",
    };

    mockCurrentUser.mockResolvedValue({
      emailAddresses: [{ emailAddress: "creator@example.com" }],
      firstName: "Creator",
      lastName: "",
    });
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

    const response = await POST();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      needsOnboarding: true,
      user: existingUser,
      profile: null,
    });
  });

  it("rejects a request that lacks a Clerk session user id", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const response = await POST();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });
});
