import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockFindFirst,
  mockInsert,
  mockValues,
  mockOnConflictDoNothing,
  mockReturning,
} = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
  mockInsert: vi.fn(),
  mockValues: vi.fn(),
  mockOnConflictDoNothing: vi.fn(),
  mockReturning: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    query: { users: { findFirst: mockFindFirst } },
    insert: mockInsert,
  },
}));

vi.mock("@/db/schema", () => ({
  users: { id: "id", email: "email" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((column, value) => ({ column, value })),
}));

import { getOrCreateLocalUser } from "./get-or-create-local-user";

describe("getOrCreateLocalUser", () => {
  const identity = {
    id: "better-auth-user",
    email: " Creator@Example.com ",
    name: " Creator ",
    emailVerified: true,
    image: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockReturnValue({ onConflictDoNothing: mockOnConflictDoNothing });
    mockOnConflictDoNothing.mockReturnValue({ returning: mockReturning });
  });

  it("keeps existing profile and onboarding state on repeated synchronization", async () => {
    const existing = {
      id: identity.id,
      email: "creator@example.com",
      name: "Saved creator name",
      onboardingStatus: "complete",
      onboardingStep: 4,
    };
    mockFindFirst.mockResolvedValue(existing);

    await expect(getOrCreateLocalUser(identity)).resolves.toBe(existing);

    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("creates a local record using the Better Auth id", async () => {
    const created = { id: identity.id, email: "creator@example.com" };
    mockFindFirst.mockResolvedValueOnce(null);
    mockReturning.mockResolvedValue([created]);

    await expect(getOrCreateLocalUser(identity)).resolves.toBe(created);

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        id: identity.id,
        email: "creator@example.com",
        name: "Creator",
        onboardingStatus: "incomplete",
        onboardingStep: 1,
      })
    );
  });

  it("returns the winning record when concurrent provisioning conflicts", async () => {
    const winner = { id: identity.id, onboardingStatus: "complete" };
    mockFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(winner);
    mockReturning.mockResolvedValue([]);

    await expect(getOrCreateLocalUser(identity)).resolves.toBe(winner);

    expect(mockFindFirst).toHaveBeenCalledTimes(2);
    expect(mockOnConflictDoNothing).toHaveBeenCalledOnce();
  });

  it("does not link a different account by matching email alone", async () => {
    mockFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    mockReturning.mockResolvedValue([]);

    await expect(getOrCreateLocalUser(identity)).rejects.toThrow(
      "Creator account could not be provisioned due to an identity conflict."
    );
  });
});
