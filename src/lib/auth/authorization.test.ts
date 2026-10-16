import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetGallerySession = vi.hoisted(() => vi.fn().mockResolvedValue(null));

const { mockAuth, mockDb } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockDb: {
    select: vi.fn().mockReturnValue(vi.fn().mockReturnValue(vi.fn().mockReturnValue(vi.fn().mockReturnValue()))),
    from: vi.fn().mockReturnValue(vi.fn().mockReturnValue(vi.fn())),
    leftJoin: vi.fn().mockReturnValue(vi.fn()),
    where: vi.fn().mockReturnValue(vi.fn()),
    limit: vi.fn().mockReturnValue(vi.fn()),
    returning: vi.fn().mockReturnValue(vi.fn()),
  },
}));

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(null);
});

vi.mock("@/lib/auth/auth", () => ({
  auth: { api: { getSession: mockAuth } },
}));

vi.mock("@/db", () => ({
  db: mockDb,
}));

// Mock the gallery session module - mock at module level
vi.mock("@/lib/gallery/session", async () => {
  const actual = (await import("@/lib/gallery/session")) as any;
  return {
    ...actual,
    getGallerySession: mockGetGallerySession,
    createGallerySession: vi.fn().mockImplementation(async () => ({
      id: "session_1",
      token: "token_123",
      isNew: true,
    })),
    requireGallerySession: vi.fn().mockImplementation(async () => null),
  };
});

import { GET as getPublicGallery } from "@/app/api/public/galleries/[slug]/route";

describe("Authorization matrix", () => {
  // ------------------------------------------------------------------
  // Public gallery access
  // ------------------------------------------------------------------

  it("public gallery returns 404 for unknown slug", async () => {
    // Mock the query chain to return empty result (no gallery found)
    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.leftJoin.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.limit.mockReturnValue(mockDb);
    mockDb.returning.mockResolvedValue({ rows: [] });

    const req = new Request("https://example.com/api/public/galleries/no-such-slug");
    const res = await getPublicGallery(req, { params: Promise.resolve({ slug: "no-such-slug" }) });

    expect(res.status).toBe(404);
  });

  it("public gallery returns 410 when expired", async () => {
    // Mock the query chain to return an expired gallery
    const expiredGallery = {
      id: "gallery_1",
      slug: "expired-slug",
      title: "Expired Gallery",
      description: "An expired gallery",
      category: "test",
      accessPin: null,
      status: "published",
      coverPhotoId: null,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() - 1000).toISOString(), // Expired 1 second ago
      clientId: null,
      clientName: null,
      clientCompany: null,
      projectName: null,
      coverUrl: null,
    };

    // Configure the mock chain to return the expired gallery
    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.leftJoin.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.limit.mockReturnValue([expiredGallery]);
    mockDb.returning.mockResolvedValue({ rows: [expiredGallery] });

    const req = new Request("https://example.com/api/public/galleries/expired-slug");
    const res = await getPublicGallery(req, { params: Promise.resolve({ slug: "expired-slug" }) });

    expect(res.status).toBe(410);
  });

  it("public gallery returns 401 when PIN required and no session", async () => {
    // Mock a gallery with PIN required
    const pinProtectedGallery = {
      id: "gallery_1",
      slug: "pin-slug",
      title: "PIN Protected Gallery",
      description: "A PIN protected gallery",
      category: "test",
      accessPin: "$2b$10$hashedpin", // This is a hashed PIN
      status: "published",
      coverPhotoId: null,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: null,
      clientId: null,
      clientName: null,
      clientCompany: null,
      projectName: null,
      coverUrl: null,
    };

    // Configure the mock chain to return the pin-protected gallery
    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.leftJoin.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.limit.mockReturnValue([pinProtectedGallery]);
    mockDb.returning.mockResolvedValue({ rows: [pinProtectedGallery] });

    // Mock getGallerySession to return null (no session)
    mockGetGallerySession.mockResolvedValue(null);

    const req = new Request("https://example.com/api/public/galleries/pin-slug");
    const res = await getPublicGallery(req, { params: Promise.resolve({ slug: "pin-slug" }) });

    expect(res.status).toBe(401);
  });
});
