import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDb, mockGetGallerySession } = vi.hoisted(() => ({
  mockDb: { select: vi.fn() },
  mockGetGallerySession: vi.fn(),
}));

vi.mock("@/db", () => ({ db: mockDb }));
vi.mock("@/lib/gallery/session", () => ({
  getGallerySession: mockGetGallerySession,
  requireGallerySession: vi.fn(),
}));
vi.mock("@/lib/gallery/pin", () => ({ comparePin: vi.fn() }));

import { GET } from "./route";

function configureQueries() {
  const results = [
    [{
      id: "gallery-1",
      slug: "sample",
      title: "Sample gallery",
      description: null,
      category: null,
      accessPin: "hashed-pin",
      status: "published",
      coverPhotoId: null,
      publishedAt: null,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
      expiresAt: null,
      clientId: null,
      clientName: null,
      clientCompany: null,
      projectName: null,
      coverUrl: null,
    }],
    [],
    [],
    [],
    [],
  ];
  const query = {
    from: vi.fn(() => query),
    leftJoin: vi.fn(() => query),
    where: vi.fn(() => query),
    orderBy: vi.fn(() => Promise.resolve(results.shift())),
    limit: vi.fn(() => Promise.resolve(results.shift())),
  };
  mockDb.select.mockReturnValue(query);
}

describe("public gallery route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureQueries();
    mockGetGallerySession.mockResolvedValue({ id: "session-1" });
  });

  it("does not include the gallery access PIN in the response", async () => {
    const response = await GET(new Request("https://example.com/api/public/galleries/sample"), {
      params: Promise.resolve({ slug: "sample" }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.gallery).not.toHaveProperty("accessPin");
  });
});
