import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetCurrentUserFromRequest, mockGetDatabaseMetrics, mockReset } = vi.hoisted(() => ({
  mockGetCurrentUserFromRequest: vi.fn(),
  mockGetDatabaseMetrics: vi.fn(),
  mockReset: vi.fn(),
}));

vi.mock("@/lib/auth/get-current-user", () => ({
  getCurrentUserFromRequest: mockGetCurrentUserFromRequest,
}));

vi.mock("@/lib/db-monitoring", () => ({
  getDatabaseMetrics: mockGetDatabaseMetrics,
  queryMonitor: { reset: mockReset },
}));

import { GET, POST } from "./route";

describe("metrics query routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.ADMIN_METRICS_KEY;
    delete process.env.ADMIN_EMAIL;
    mockGetCurrentUserFromRequest.mockResolvedValue(null);
    mockGetDatabaseMetrics.mockReturnValue({ queries: [] });
  });

  it("rejects access when the metrics key is unset", async () => {
    const response = await GET(new NextRequest("https://example.com/api/metrics/queries"));

    expect(response.status).toBe(403);
    expect(mockGetDatabaseMetrics).not.toHaveBeenCalled();
  });

  it("accepts a matching configured metrics key", async () => {
    process.env.ADMIN_METRICS_KEY = "metrics-secret";

    const response = await GET(new NextRequest("https://example.com/api/metrics/queries", {
      headers: { "x-admin-key": "metrics-secret" },
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ queries: [] });
  });

  it("accepts an authenticated configured admin", async () => {
    process.env.ADMIN_EMAIL = "admin@example.com";
    mockGetCurrentUserFromRequest.mockResolvedValue({
      email: "admin@example.com",
    });

    const response = await POST(new NextRequest("https://example.com/api/metrics/queries/reset", {
      method: "POST",
    }));

    expect(response.status).toBe(200);
    expect(mockReset).toHaveBeenCalledOnce();
  });
});
