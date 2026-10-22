import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAuth, mockDb } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockDb: {
    query: {
      users: { findFirst: vi.fn() },
    },
    select: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: { api: { getSession: mockAuth } },
}));

vi.mock("@/db", () => ({ db: mockDb }));

import { GET, POST } from "./route";

function selectChain(rows: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(rows),
  };
}

function updateChain(rows: unknown[]) {
  return {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue(rows),
  };
}

describe("onboarding routes", () => {
  const sessionUser = {
    id: "creator-1",
    email: "creator@example.com",
    name: "Creator",
  };
  const incompleteUser = {
    ...sessionUser,
    handle: null,
    onboardingStatus: "incomplete",
    onboardingStep: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: sessionUser });
    mockDb.query.users.findFirst.mockResolvedValue(incompleteUser);
    mockDb.select
      .mockReturnValueOnce(selectChain([]))
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      })
      .mockReturnValueOnce(selectChain([]));
  });

  it("marks a new local user eligible without established creator data", async () => {
    const response = (await GET(new Request("http://localhost/api/onboarding")))!;
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.eligible).toBe(true);
    expect(body.user.onboardingStatus).toBe("incomplete");
  });

  it("rejects unauthenticated onboarding requests", async () => {
    mockAuth.mockResolvedValue(null);

    const response = (await GET(new Request("http://localhost/api/onboarding")))!;

    expect(response.status).toBe(401);
  });

  it("persists completion without changing incomplete flows", async () => {
    const completedUser = { ...incompleteUser, onboardingStatus: "complete", onboardingStep: 4 };
    mockDb.update.mockReturnValue(updateChain([completedUser]));

    const response = (await POST(new Request("http://localhost/api/onboarding", {
      method: "POST",
      body: JSON.stringify({ section: "finish" }),
    })))!;

    expect(response.status).toBe(200);
    expect((await response.json()).user.onboardingStatus).toBe("complete");
    expect(mockDb.update).toHaveBeenCalled();
  });

  it("keeps a skipped business step incomplete and resumable", async () => {
    const skippedBusinessUser = { ...incompleteUser, onboardingStep: 4 };
    mockDb.update.mockReturnValue(updateChain([skippedBusinessUser]));

    const response = (await POST(new Request("http://localhost/api/onboarding", {
      method: "POST",
      body: JSON.stringify({ section: "business", skip: true }),
    })))!;

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.skipped).toBe(true);
    expect(body.user.onboardingStatus).toBe("incomplete");
    expect(body.user.onboardingStep).toBe(4);
  });
});
