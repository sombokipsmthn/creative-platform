import { del, list, put } from "@vercel/blob";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export type StorageBody = Buffer;
export type StorageObject = { path: string; url: string; size: number; contentType: string };
export type RetrievedStorageObject = { body: Buffer; contentType: string };

export interface GalleryStorage {
  putObject(input: { path: string; body: Buffer | Uint8Array; contentType: string }): Promise<StorageObject>;
  deleteObject(pathOrUrl: string): Promise<void>;
  getObject(path: string): Promise<RetrievedStorageObject | null>;
}

function getProvider() {
  const configured = process.env.STORAGE_PROVIDER?.trim().toLowerCase();
  if (configured) return configured;
  if (process.env.NODE_ENV !== "production") return "local";
  if (process.env.BLOB_READ_WRITE_TOKEN) return "vercel-blob";
  throw new Error("Gallery storage is not configured. Set STORAGE_PROVIDER=vercel-blob with BLOB_READ_WRITE_TOKEN, or configure R2_ACCOUNT_ID, R2_BUCKET, and CLOUDFLARE_API_TOKEN.");
}

function safeObjectPath(objectPath: string) {
  const normalized = objectPath.replaceAll("\\", "/");
  if (!normalized || normalized.startsWith("/") || normalized.includes("?") || normalized.includes("#") || /[\u0000-\u001f]/.test(normalized) || normalized.split("/").some((part) => !part || part === "." || part === "..")) {
    throw new Error("Invalid storage path.");
  }
  return normalized;
}

function pathFromPathOrUrl(pathOrUrl: string) {
  if (pathOrUrl.includes("?key=")) {
    return new URL(pathOrUrl, "http://localhost").searchParams.get("key") || "";
  }
  return pathOrUrl;
}

function localRoot() {
  return path.join(process.cwd(), ".local-storage");
}

function localObjectPath(objectPath: string) {
  const root = localRoot();
  const resolved = path.resolve(root, safeObjectPath(objectPath));
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) throw new Error("Invalid storage path.");
  return resolved;
}

class LocalStorage implements GalleryStorage {
  async putObject(input: { path: string; body: Buffer | Uint8Array; contentType: string }) {
    const objectPath = safeObjectPath(input.path);
    const filePath = localObjectPath(objectPath);
    await mkdir(path.dirname(filePath), { recursive: true });
    const body = Buffer.isBuffer(input.body) ? input.body : Buffer.from(input.body);
    await writeFile(filePath, body, { flag: "wx" }).catch(async (error: NodeJS.ErrnoException) => {
      if (error.code !== "EEXIST") throw error;
      await writeFile(filePath, body);
    });
    return { path: objectPath, url: `/api/public/galleries/media?key=${encodeURIComponent(objectPath)}`, size: body.byteLength, contentType: input.contentType };
  }

  async deleteObject(pathOrUrl: string) {
    const objectPath = pathFromPathOrUrl(pathOrUrl);
    try { await unlink(localObjectPath(objectPath)); } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }

  async getObject(objectPath: string) {
    const normalizedPath = pathFromPathOrUrl(objectPath);
    const filePath = localObjectPath(normalizedPath);
    try {
      const body = await readFile(filePath);
      const extension = path.extname(filePath).toLowerCase();
      const contentTypes: Record<string, string> = {
        ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
        ".heic": "image/heic", ".heif": "image/heif", ".mp4": "video/mp4", ".mov": "video/quicktime",
        ".avi": "video/x-msvideo", ".mkv": "video/x-matroska", ".webm": "video/webm", ".flv": "video/x-flv", ".wmv": "video/x-ms-wmv",
      };
      return { body, contentType: contentTypes[extension] || "application/octet-stream" };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }
}

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !bucket || !token) throw new Error("R2 storage is not configured. Set R2_ACCOUNT_ID, R2_BUCKET and CLOUDFLARE_API_TOKEN.");
  return { accountId, bucket, token };
}

function r2ObjectUrl(objectPath: string) {
  const { accountId, bucket } = getR2Config();
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects/${safeObjectPath(objectPath).split("/").map(encodeURIComponent).join("/")}`;
}

function r2PublicUrl(objectPath: string) {
  return `/api/public/galleries/media?key=${encodeURIComponent(safeObjectPath(objectPath))}`;
}

class VercelBlobStorage implements GalleryStorage {
  private async resolveUrl(pathOrUrl: string): Promise<string | null> {
    const normalizedPath = pathFromPathOrUrl(pathOrUrl);
    if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath;

    const objectPath = safeObjectPath(normalizedPath);
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) throw new Error("Vercel Blob storage is not configured. Set BLOB_READ_WRITE_TOKEN.");

    // @vercel/blob head() requires a Blob URL, not the pathname stored in
    // gallery_photos. Resolve the pathname to its URL through Blob listing.
    const result = await list({ prefix: objectPath, limit: 1000, token });
    const blob = result.blobs.find((item) => item.pathname === objectPath);
    return blob?.url ?? null;
  }

  async putObject(input: { path: string; body: Buffer | Uint8Array; contentType: string }) {
    const body = Buffer.isBuffer(input.body) ? input.body : Buffer.from(input.body);
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) throw new Error("Vercel Blob storage is not configured.");
    const blob = await put(input.path, body, { access: "public", addRandomSuffix: false, contentType: input.contentType, token });
    const objectPath = safeObjectPath(blob.pathname);
    return { path: objectPath, url: `/api/public/galleries/media?key=${encodeURIComponent(objectPath)}`, size: body.byteLength, contentType: input.contentType };
  }

  async deleteObject(pathOrUrl: string): Promise<void> {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) throw new Error("Vercel Blob storage is not configured. Set BLOB_READ_WRITE_TOKEN.");
    const url = await this.resolveUrl(pathOrUrl);
    if (url) await del(url, { token });
  }

  async getObject(objectPath: string) {
    const url = await this.resolveUrl(objectPath);
    if (!url) return null;
    const response = await fetch(url, { cache: "no-store" });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Vercel Blob read failed (${response.status}).`);
    return { body: Buffer.from(await response.arrayBuffer()), contentType: response.headers.get("content-type") || "application/octet-stream" };
  }
}

class R2Storage implements GalleryStorage {
  async putObject(input: { path: string; body: Buffer | Uint8Array; contentType: string }) {
    const { token } = getR2Config();
    const body = Buffer.isBuffer(input.body) ? input.body : Buffer.from(input.body);
    const response = await fetch(r2ObjectUrl(input.path), { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": input.contentType }, body: body as unknown as BodyInit });
    if (!response.ok) throw new Error(`R2 upload failed (${response.status}): ${await response.text()}`);
    return { path: safeObjectPath(input.path), url: r2PublicUrl(input.path), size: body.byteLength, contentType: input.contentType };
  }

  async deleteObject(pathOrUrl: string) {
    const rawPath = pathFromPathOrUrl(pathOrUrl);
    const objectPath = rawPath.startsWith("http") ? decodeURIComponent(new URL(rawPath).pathname.split("/objects/")[1] || "") : rawPath;
    if (!objectPath) return;
    safeObjectPath(objectPath);
    const { token } = getR2Config();
    const response = await fetch(r2ObjectUrl(objectPath), { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok && response.status !== 404) throw new Error(`R2 delete failed (${response.status}).`);
  }

  async getObject(objectPath: string) {
    const normalizedPath = pathFromPathOrUrl(objectPath);
    const response = await fetch(r2ObjectUrl(safeObjectPath(normalizedPath)), { headers: { Authorization: `Bearer ${getR2Config().token}` }, cache: "no-store" });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`R2 read failed (${response.status}).`);
    return { body: Buffer.from(await response.arrayBuffer()), contentType: response.headers.get("content-type") || "application/octet-stream" };
  }
}

export function getGalleryStorage(): GalleryStorage {
  const provider = getProvider();
  if (provider === "local") return new LocalStorage();
  if (provider === "r2") return new R2Storage();
  if (provider === "vercel-blob") return new VercelBlobStorage();
  throw new Error(`Unsupported storage provider: ${provider}`);
}

export function getGalleryStorageProvider() { return getProvider(); }
