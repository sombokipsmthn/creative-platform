import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockAuth,
  mockGetOrCreateLocalUser,
  mockFindProfile,
  mockLogUnexpectedApiError,
} = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockGetOrCreateLocalUser: vi.fn(),
  mockFindProfile: vi.fn(),
  mockLogUnexpectedApiError: vi.fn(),
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: { api: { getSession: mockAuth } },
}));

vi.mock("@/db", () => ({
  db: {
    query: {
      creatorProfiles: { findFirst: mockFindProfile },
    },
  },
}));

vi.mock("@/lib/auth/get-or-create-local-user", () => ({
  getOrCreateLocalUser: mockGetOrCreateLocalUser,
}));

vi.mock("@/lib/api/route-boundaries", () => ({
  logUnexpectedApiError: mockLogUnexpectedApiError,
}));

import { POST } from "./route";

describe("POST /api/users/sync", () => {
  const authUser = {
    id: "better-auth-user",
    email: "creator@example.com",
    name: "Creator",
    emailVerified: true,
    image: null,
  };
  const localUser = {
    id: authUser.id,
    email: authUser.email,
    name: authUser.name,
    onboardingStatus: "incomplete",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: authUser, session: { id: "session_1" } });
    mockGetOrCreateLocalUser.mockResolvedValue(localUser);
    mockFindProfile.mockResolvedValue(null);
  });

  it("synchronizes an authenticated Better Auth identity", async () => {
    const response = await POST(new Request("http://localhost/api/users/sync"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      needsOnboarding: true,
      user: localUser,
      profile: null,
    });
    expect(mockGetOrCreateLocalUser).toHaveBeenCalledWith(authUser);
  });

  it("rejects requests without an authenticated session", async () => {
    mockAuth.mockResolvedValue(null);

    const response = await POST(new Request("http://localhost/api/users/sync"));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    expect(mockGetOrCreateLocalUser).not.toHaveBeenCalled();
  });

  it("returns an existing profile without changing the response contract", async () => {
    const profile = { id: "profile_1", userId: authUser.id, bio: "Existing" };
    mockFindProfile.mockResolvedValue(profile);

    const response = await POST(new Request("http://localhost/api/users/sync"));

    expect(await response.json()).toEqual({
      needsOnboarding: true,
      user: localUser,
      profile,
    });
  });

  it("logs provisioning failures and returns a generic server error", async () => {
    mockGetOrCreateLocalUser.mockRejectedValue(new Error("private database detail"));

    const response = await POST(new Request("http://localhost/api/users/sync"));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Unable to synchronize creator account.",
    });
    expect(mockLogUnexpectedApiError).toHaveBeenCalled();
  });
});
