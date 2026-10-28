import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDb, mockGetUser, mockGetSession, mockStorage } = vi.hoisted(() => {
  const query = { from: vi.fn(), innerJoin: vi.fn(), leftJoin: vi.fn(), where: vi.fn(), limit: vi.fn() };
  for (const method of ["from", "innerJoin", "leftJoin", "where"]) query[method as "from"] = vi.fn(() => query) as never;
  const galleryFind = vi.fn();
  const projectFind = vi.fn();
  return {
    mockDb: { select: vi.fn(() => query), query: { galleries: { findFirst: galleryFind }, projects: { findFirst: projectFind } } },
    mockGetUser: vi.fn(),
    mockGetSession: vi.fn(),
    mockStorage: { getObject: vi.fn() },
  };
});

vi.mock("@/db", () => ({ db: mockDb }));
vi.mock("@/lib/auth/get-current-user", () => ({ getCurrentUserFromRequest: mockGetUser }));
vi.mock("@/lib/gallery/session", () => ({ getGallerySession: mockGetSession }));
vi.mock("@/lib/gallery/storage", () => ({ getGalleryStorage: () => mockStorage }));

import { GET } from "./route";

type MockMedia = {
  galleryId: string;
  isHidden: boolean;
  clientVisibility: string | null;
  photoSelection: string;
  collectionSelection: string | null;
  portfolioMode: string;
  galleryStatus: string;
  galleryPublishedAt: Date | null;
  accessPin: string | null;
  expiresAt: Date | null;
  projectId: string | null;
};

const baseMedia: MockMedia = {
  galleryId: "gallery-1", isHidden: false, clientVisibility: "all", photoSelection: "include", collectionSelection: "inherit",
  portfolioMode: "selected", galleryStatus: "published", galleryPublishedAt: new Date("2025-01-01"), accessPin: null,
  expiresAt: null, projectId: "project-1",
};
const baseGallery = { id: "gallery-1", creatorId: "creator-1", projectId: "project-1", expiresAt: null };

function mediaRequest(key = "galleries/gallery-1/photo-1/display.jpg") {
  return new Request(`https://creative.test/api/public/galleries/media?key=${encodeURIComponent(key)}`);
}

function setupMedia(media: MockMedia = baseMedia) {
  const query = mockDb.select();
  query.limit.mockResolvedValue([media]);
  mockDb.query.galleries.findFirst.mockResolvedValue(baseGallery);
  mockDb.query.projects.findFirst.mockResolvedValue({ id: "project-1", creatorId: "creator-1", visibility: "public", publishedAt: new Date("2025-01-01") });
  mockStorage.getObject.mockResolvedValue({ body: Buffer.from("media"), contentType: "image/jpeg" });
}

describe("public gallery media authorization route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue(null);
    mockGetSession.mockResolvedValue(null);
    setupMedia();
  });

  it("serves an explicitly curated published portfolio asset", async () => {
    const response = await GET(mediaRequest());
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/jpeg");
    expect(response.headers.get("Cache-Control")).toContain("public");
    expect(mockStorage.getObject).toHaveBeenCalledWith("galleries/gallery-1/photo-1/display.jpg");
  });

  it("denies private, hidden, uncurated, PIN-protected, or expired media", async () => {
    for (const media of [
      { ...baseMedia, galleryStatus: "draft" },
      { ...baseMedia, isHidden: true },
      { ...baseMedia, photoSelection: "exclude" },
      { ...baseMedia, accessPin: "pin-hash" },
      { ...baseMedia, expiresAt: new Date("2000-01-01") },
    ]) {
      setupMedia(media);
      const response = await GET(mediaRequest());
      expect(response.status).not.toBe(200);
    }
    expect(mockStorage.getObject).not.toHaveBeenCalled();
  });

  it("allows the gallery owner to read private media", async () => {
    setupMedia({ ...baseMedia, galleryStatus: "draft", isHidden: true });
    mockGetUser.mockResolvedValue({ id: "creator-1" });
    const response = await GET(mediaRequest());
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("private");
  });

  it("allows valid gallery sessions only for visible media and respects collection visibility", async () => {
    setupMedia({ ...baseMedia, galleryStatus: "published" });
    mockGetSession.mockResolvedValue({ id: "session-1", clientId: "client-1" });
    expect((await GET(mediaRequest())).status).toBe(200);

    setupMedia({ ...baseMedia, clientVisibility: "authorized", galleryStatus: "published" });
    mockGetSession.mockResolvedValue({ id: "session-2", clientId: null });
    expect((await GET(mediaRequest())).status).toBe(401);
  });

  it("returns safe errors for unknown objects and invalid media keys", async () => {
    setupMedia();
    mockDb.select().limit.mockResolvedValueOnce([]);
    const missing = await GET(mediaRequest("galleries/unknown/missing.jpg"));
    expect(missing.status).toBe(404);
    expect(mockStorage.getObject).not.toHaveBeenCalled();
    expect((await GET(mediaRequest("galleries/../secrets"))).status).toBe(400);
  });

  it("returns not found when the authorized database record has no stored object", async () => {
    setupMedia();
    mockStorage.getObject.mockResolvedValue(null);
    expect((await GET(mediaRequest())).status).toBe(404);
  });
});
