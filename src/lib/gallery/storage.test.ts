import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.resetModules();
});

describe("gallery storage provider selection", () => {
  it("uses local storage outside production by default", async () => {
    delete process.env.STORAGE_PROVIDER;
    vi.stubEnv("NODE_ENV", "test");
    const storage = await import("./storage");
    expect(storage.getGalleryStorageProvider()).toBe("local");
  });

  it("keeps existing production blob configuration as the default", async () => {
    delete process.env.STORAGE_PROVIDER;
    vi.stubEnv("NODE_ENV", "production");
    process.env.BLOB_READ_WRITE_TOKEN = "test-token";
    const storage = await import("./storage");
    expect(storage.getGalleryStorageProvider()).toBe("vercel-blob");
  });

  it("fails explicitly for unconfigured production storage", async () => {
    delete process.env.STORAGE_PROVIDER;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.R2_ACCOUNT_ID;
    delete process.env.R2_BUCKET;
    delete process.env.CLOUDFLARE_API_TOKEN;
    vi.stubEnv("NODE_ENV", "production");
    const storage = await import("./storage");
    expect(() => storage.getGalleryStorage()).toThrow(/Gallery storage is not configured/);
  });

  it("rejects unsafe local storage paths and supports MIME lookup for stored videos", async () => {
    process.env.STORAGE_PROVIDER = "local";
    const storage = await import("./storage");
    const provider = storage.getGalleryStorage();
    await expect(provider.getObject("galleries/../outside" )).rejects.toThrow(/Invalid storage path/);
    const objectPath = "galleries/test-gallery/test-media/display.mp4";
    const object = await provider.putObject({ path: objectPath, body: Buffer.from("video"), contentType: "video/mp4" });
    expect(object.contentType).toBe("video/mp4");
    expect((await provider.getObject(objectPath))?.contentType).toBe("video/mp4");
    await provider.deleteObject(object.url);
    expect(await provider.getObject(objectPath)).toBeNull();
    expect(await provider.getObject("galleries/does-not-exist/display.mp4")).toBeNull();
  });

  it("rejects unsupported providers", async () => {
    process.env.STORAGE_PROVIDER = "unknown";
    const storage = await import("./storage");
    expect(() => storage.getGalleryStorage()).toThrow(/Unsupported storage provider/);
  });
});
