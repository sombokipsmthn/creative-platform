import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAuth, mockCurrentUser, mockDb } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockCurrentUser: vi.fn(),
  mockDb: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
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
    mockDb.query.users.findFirst.mockResolvedValue(null);
    mockDb.insert.mockReturnValue({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([
          {
            id: "db_user_1",
            authUserId: "user_123",
            email: "creator@example.com",
            name: "Creator",
          },
        ]),
      })),
    });

    const response = await POST();

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      authUserId: "user_123",
      email: "creator@example.com",
      name: "Creator",
    });
    expect(mockDb.insert).toHaveBeenCalled();
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
    mockDb.query.users.findFirst.mockResolvedValue(existingUser);

    const response = await POST();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(existingUser);
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("rejects a request that lacks a Clerk session user id", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const response = await POST();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });
});
