import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFetchContractByToken } = vi.hoisted(() => ({
  mockFetchContractByToken: vi.fn(),
}));

vi.mock("@/lib/contracts/server", () => ({
  fetchContractByToken: mockFetchContractByToken,
  signPublicContract: vi.fn(),
  declinePublicContract: vi.fn(),
}));

import { GET } from "./route";

describe("public contract route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns only the explicit public contract DTO", async () => {
    mockFetchContractByToken.mockResolvedValue({
      id: "internal-id",
      creatorId: "creator-id",
      clientId: "client-id",
      projectId: "project-id",
      quoteId: "quote-id",
      templateId: "template-id",
      title: "Service agreement",
      contractNumber: "C-001",
      status: "sent",
      content: "Contract terms",
      currency: "KES",
      totalAmount: 1000,
      token: "secret-token",
      expiresAt: new Date("2026-12-31"),
      sentAt: new Date("2026-01-01"),
      viewedAt: null,
      signedAt: null,
      signerName: null,
      signerEmail: null,
      signedIp: "192.0.2.1",
      signedUserAgent: "internal-agent",
      declinedAt: null,
      cancelledAt: null,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });

    const response = await GET(new NextRequest("https://example.com/api/public/contracts/secret-token"), {
      params: Promise.resolve({ token: "secret-token" }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      title: "Service agreement",
      contractNumber: "C-001",
      status: "sent",
      content: "Contract terms",
      currency: "KES",
      totalAmount: 1000,
      expiresAt: "2026-12-31T00:00:00.000Z",
      sentAt: "2026-01-01T00:00:00.000Z",
      viewedAt: null,
      signedAt: null,
      signerName: null,
      signerEmail: null,
      declinedAt: null,
      cancelledAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
  });
});
