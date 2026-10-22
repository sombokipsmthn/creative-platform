import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAuth, mockDb } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockDb: {
    query: { users: { findFirst: vi.fn() } },
    update: vi.fn(),
  },
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: { api: { getSession: mockAuth } },
}));

vi.mock("@/db", () => ({ db: mockDb }));

import { POST } from "./route";

describe("POST /api/onboarding/dismiss", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "creator-1" } });
    mockDb.query.users.findFirst.mockResolvedValue({ id: "creator-1" });
  });

  it("rejects unauthenticated requests", async () => {
    mockAuth.mockResolvedValue(null);

    const response = await POST(new Request("http://localhost/api/onboarding/dismiss", { method: "POST" }));

    expect(response.status).toBe(401);
  });

  it("persists skipped status and final step", async () => {
    const updatedUser = { id: "creator-1", onboardingStatus: "skipped", onboardingStep: 4 };
    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([updatedUser]),
    });

    const response = await POST(new Request("http://localhost/api/onboarding/dismiss", { method: "POST" }));

    expect(response.status).toBe(200);
    expect((await response.json()).user).toEqual(updatedUser);
  });
});
