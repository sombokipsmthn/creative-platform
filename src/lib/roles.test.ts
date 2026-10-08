import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentRole, requireRole } from "./roles";

const { mockSession } = vi.hoisted(() => ({ mockSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({
  getCurrentSession: mockSession,
}));

describe("roles", () => {
  beforeEach(() => {
    mockSession.mockReset();
  });

  it("returns admin for the configured admin email", async () => {
    process.env.ADMIN_EMAIL = "admin@example.com";
    mockSession.mockResolvedValue({ user: { id: "user_1", email: "admin@example.com" }, session: { id: "session_1" } });
    await expect(getCurrentRole()).resolves.toBe("admin");
  });

  it("returns null for an unauthenticated session", async () => {
    mockSession.mockResolvedValue(null);
    await expect(getCurrentRole()).resolves.toBeNull();
  });

  it("allows access when the role matches and throws when it does not", async () => {
    mockSession.mockResolvedValue(null);

    await expect(requireRole("client")).rejects.toThrow('Forbidden: requires role "client", got "null"');
  });
});
