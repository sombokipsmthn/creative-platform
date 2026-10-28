import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDb, mockAuth, mockImage, mockVideo, mockStorage, mockStorageFactory } = vi.hoisted(() => {
  const mockStorage = { putObject: vi.fn(), getObject: vi.fn(), deleteObject: vi.fn() };
  const mockQuery = { from: vi.fn(), where: vi.fn(), limit: vi.fn() };
  mockQuery.from.mockReturnValue(mockQuery);
  mockQuery.where.mockReturnValue(mockQuery);
  return {
    mockDb: { select: vi.fn(() => mockQuery), execute: vi.fn() },
    mockAuth: vi.fn(),
    mockImage: vi.fn(),
    mockVideo: vi.fn(),
    mockStorage,
    mockStorageFactory: vi.fn(() => mockStorage),
  };
});

vi.mock("@/db", () => ({ db: mockDb }));
vi.mock("@/lib/auth/get-current-user", () => ({ getCurrentUserFromRequest: mockAuth }));
vi.mock("@/lib/gallery/storage", () => ({ getGalleryStorage: mockStorageFactory }));
vi.mock("@/lib/gallery/image-processing", () => ({ processImage: mockImage }));
vi.mock("@/lib/gallery/video-processing", () => ({ processVideo: mockVideo }));

import { POST } from "./route";

const query = mockDb.select();
const imageResult = {
  original: Buffer.from("original"), display: Buffer.from("display"), thumbnail: Buffer.from("thumbnail"), watermark: Buffer.from("watermark"),
  mimeType: "image/jpeg", width: 1200, height: 800,
};
const videoResult = {
  original: Buffer.from("video-original"), display: Buffer.from("video-display"), thumbnail: Buffer.from("video-thumbnail"), watermark: Buffer.from("video-watermark"),
  mimeType: "video/mp4", width: 1920, height: 1080, duration: 12, fileSize: 14, videoCodec: "h264", audioCodec: "aac",
};

function uploadRequest(name: string, type: string, bytes = "file") {
  const form = new FormData();
  form.set("galleryId", "gallery-1");
  form.set("file", new File([bytes], name, { type }));
  return new Request("https://creative.test/api/galleries/upload", { method: "POST", body: form });
}

function setupOwnedGallery() {
  query.limit.mockResolvedValue([{ id: "gallery-1" }]);
}

function setupSuccessDatabase() {
  mockDb.execute
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({ rows: [{ max_order: 2 }] })
    .mockResolvedValueOnce({ rows: [{ id: "photo-1", filename: "uploaded", mime_type: "image/jpeg", file_size: 4, sort_order: 3 }] });
}

function setupStorage() {
  mockStorage.putObject.mockImplementation(async ({ path, body, contentType }: { path: string; body: Buffer; contentType: string }) => ({
    path, url: `/api/public/galleries/media?key=${encodeURIComponent(path)}`, size: body.length, contentType,
  }));
}

describe("gallery multipart upload route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ id: "creator-1" });
    setupOwnedGallery();
    setupStorage();
    mockStorage.getObject.mockResolvedValue(null);
    mockImage.mockResolvedValue(imageResult);
    mockVideo.mockResolvedValue(videoResult);
    mockDb.execute.mockResolvedValue({ rows: [] });
  });

  it("processes a multipart image and returns the existing photo response envelope", async () => {
    setupSuccessDatabase();
    const response = await POST(uploadRequest("portrait.jpg", "image/jpeg"));
    expect(response.status).toBe(201);
    expect((await response.json()).photo.id).toBe("photo-1");
    expect(mockImage).toHaveBeenCalledOnce();
    expect(mockVideo).not.toHaveBeenCalled();
    expect(mockStorage.putObject).toHaveBeenCalledTimes(4);
    expect(mockStorage.putObject).toHaveBeenCalledWith(expect.objectContaining({ path: expect.stringMatching(/original\.jpg$/), contentType: "image/jpeg" }));
    expect(mockDb.execute).toHaveBeenCalledTimes(3);
  });

  it("processes videos separately, retains source type/size, and stores playable MP4 delivery", async () => {
    setupSuccessDatabase();
    await POST(uploadRequest("clip.mov", "video/quicktime", "video-bytes"));
    expect(mockVideo).toHaveBeenCalledOnce();
    expect(mockImage).not.toHaveBeenCalled();
    expect(mockStorage.putObject).toHaveBeenCalledWith(expect.objectContaining({ path: expect.stringMatching(/original\.mov$/), contentType: "video/quicktime" }));
    expect(mockStorage.putObject).toHaveBeenCalledWith(expect.objectContaining({ path: expect.stringMatching(/display\.mp4$/), contentType: "video/mp4" }));
    const insertQuery = mockDb.execute.mock.calls[2][0];
    expect(JSON.stringify(insertQuery)).toContain("video/quicktime");
    expect(JSON.stringify(insertQuery)).toContain("11");
  });

  it("rejects unauthenticated users and users who do not own the gallery", async () => {
    mockAuth.mockResolvedValueOnce(null);
    expect((await POST(uploadRequest("portrait.jpg", "image/jpeg"))).status).toBe(401);
    query.limit.mockResolvedValueOnce([]);
    expect((await POST(uploadRequest("portrait.jpg", "image/jpeg"))).status).toBe(404);
    expect(mockImage).not.toHaveBeenCalled();
  });

  it("rejects invalid MIME and oversized files before processing", async () => {
    expect((await POST(uploadRequest("payload.exe", "application/octet-stream"))).status).toBe(415);
    const form = new FormData();
    form.set("galleryId", "gallery-1");
    form.set("file", new File([new Uint8Array(100 * 1024 * 1024 + 1)], "large.jpg", { type: "image/jpeg" }));
    expect((await POST(new Request("https://creative.test/api/galleries/upload", { method: "POST", body: form }))).status).toBe(413);
    expect(mockImage).not.toHaveBeenCalled();
  });

  it("cleans up successfully stored objects when a later storage write fails", async () => {
    mockStorage.putObject
      .mockResolvedValueOnce({ path: "galleries/gallery-1/photo-1/original.jpg", url: "original", size: 2, contentType: "image/jpeg" })
      .mockRejectedValueOnce(new Error("storage unavailable"))
      .mockResolvedValueOnce({ path: "galleries/gallery-1/photo-1/thumbnail.jpg", url: "thumbnail", size: 2, contentType: "image/jpeg" })
      .mockResolvedValueOnce({ path: "galleries/gallery-1/photo-1/watermark.jpg", url: "watermark", size: 2, contentType: "image/jpeg" });
    const response = await POST(uploadRequest("portrait.jpg", "image/jpeg"));
    expect(response.status).toBe(500);
    expect(mockStorage.deleteObject).toHaveBeenCalledTimes(3);
    expect(mockDb.execute).toHaveBeenCalledOnce();
  });
});
