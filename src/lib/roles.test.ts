import { beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "@clerk/nextjs/server";

import { getCurrentRole, requireRole } from "./roles";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

describe("roles", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
  });

  it("reads the current role from Clerk session metadata", async () => {
    vi.mocked(auth).mockResolvedValue({
      sessionClaims: {
        metadata: { role: "admin" },
      },
    } as unknown as Awaited<ReturnType<typeof auth>>);

    await expect(getCurrentRole()).resolves.toBe("admin");
  });

  it("returns null when the session has no role metadata", async () => {
    vi.mocked(auth).mockResolvedValue(
      { sessionClaims: {} } as unknown as Awaited<ReturnType<typeof auth>>,
    );

    await expect(getCurrentRole()).resolves.toBeNull();
  });

  it("allows access when the role matches and throws when it does not", async () => {
    vi.mocked(auth).mockResolvedValue({
      sessionClaims: {
        metadata: { role: "client" },
      },
    } as unknown as Awaited<ReturnType<typeof auth>>);

    await expect(requireRole("client")).resolves.toBeUndefined();
    await expect(requireRole("admin")).rejects.toThrow(
      'Forbidden: requires role "admin", got "client"'
    );
  });
});
