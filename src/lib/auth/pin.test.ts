import { beforeEach, describe, expect, it, vi } from "vitest";

import { hashPin, comparePin } from "@/lib/gallery/pin";

describe("PIN comparison logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("matches correct PIN", async () => {
    const hash = await hashPin("1234");
    const result = await comparePin("1234", hash!);
    expect(result).toBe(true);
  });

  it("rejects wrong PIN", async () => {
    const hash = await hashPin("1234");
    const result = await comparePin("5678", hash!);
    expect(result).toBe(false);
  });

  it("empty PIN returns false when hash exists", async () => {
    const hash = await hashPin("1234");
    // Hash exists but PIN is empty - should fail
    const result = await comparePin("", hash!);
    expect(result).toBe(false);
  });

  it("open access when no hash configured", async () => {
    // When there's no PIN hash, access is open
    const result = await comparePin("anything", null);
    expect(result).toBe(true);
  });
});
