import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAuth, mockDb } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockDb: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
      clients: {
        findFirst: vi.fn(),
      },
    },
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth,
}));

vi.mock("@/db", () => ({
  db: mockDb,
}));

import { POST, calculateTotals, normalizeCurrency, normalizeItems, normalizeStatus } from "./route";

describe("quotes route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: "user_456" });
  });

  it("normalizes status, currency, and line items before quote creation", () => {
    expect(normalizeStatus(" SENT ")).toBe("sent");
    expect(normalizeStatus("unknown")).toBe("draft");
    expect(normalizeCurrency("usd")).toBe("USD");

    expect(
      normalizeItems([
        {
          quantity: "2",
          rate: "150",
          category: "Production",
          description: "  Brand shoot  ",
          unit: "day",
          notes: "Rush",
        },
      ])
    ).toEqual([
      {
        category: "Production",
        description: "Brand shoot",
        quantity: 2,
        unit: "day",
        rate: 150,
        amount: 300,
        notes: "Rush",
      },
    ]);

    expect(
      calculateTotals({
        items: [{ quantity: 2, rate: 150 }],
        tax: "250",
      })
    ).toEqual({
      subtotal: 300,
      tax: 250,
      total: 550,
    });
  });

  it("creates a quote in draft state even when the caller sends an accepted status", async () => {
    const user = { id: "creator_1", authUserId: "user_456" };
    mockDb.query.users.findFirst.mockResolvedValue(user);
    mockDb.query.clients.findFirst.mockResolvedValue({ id: "client_1", creatorId: "creator_1" });

    mockDb.insert
      .mockReturnValueOnce({
        values: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([
            {
              id: "quote_1",
              creatorId: "creator_1",
              clientId: "client_1",
              title: "Brand campaign",
              status: "draft",
              subtotal: 300,
              tax: 0,
              total: 300,
            },
          ]),
        })),
      })
      .mockReturnValueOnce({
        values: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([
            {
              id: "item_1",
              quoteId: "quote_1",
              category: "Production",
              description: "Brand shoot",
              quantity: 2,
              unit: "day",
              rate: 150,
              amount: 300,
              notes: null,
            },
          ]),
        })),
      });

    const response = await POST(
      new Request("https://example.com/api/quotes", {
        method: "POST",
        body: JSON.stringify({
          title: "Brand campaign",
          clientId: "client_1",
          status: "accepted",
          items: [{ quantity: 2, rate: 150, description: "Brand shoot" }],
        }),
      })
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      status: "draft",
      subtotal: 300,
      total: 300,
    });
  });

  it("rejects quote creation when the payload is missing required data", async () => {
    mockDb.query.users.findFirst.mockResolvedValue({ id: "creator_1", authUserId: "user_456" });

    const response = await POST(
      new Request("https://example.com/api/quotes", {
        method: "POST",
        body: JSON.stringify({
          title: "",
          items: [{ quantity: 2, rate: 150, description: "" }],
        }),
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "title is required" });
  });
});
