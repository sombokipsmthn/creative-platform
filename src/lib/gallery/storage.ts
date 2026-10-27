import { del, put } from "@vercel/blob";
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
  return (process.env.STORAGE_PROVIDER || (process.env.NODE_ENV === "production" ? "r2" : "local")).toLowerCase();
}

function safeObjectPath(objectPath: string) {
  const normalized = objectPath.replaceAll("\\", "/");
  if (!normalized || normalized.startsWith("/") || normalized.split("/").some((part) => part === "..")) {
    throw new Error("Invalid storage path.");
  }
  return normalized;
}

function localRoot() {
  return path.join(process.cwd(), ".local-storage");
}

function localObjectPath(objectPath: string) {
  return path.join(localRoot(), safeObjectPath(objectPath));
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
    const objectPath = pathOrUrl.includes("?key=")
      ? decodeURIComponent(new URL(pathOrUrl, "http://localhost").searchParams.get("key") || "")
      : pathOrUrl;
    try { await unlink(localObjectPath(objectPath)); } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }

  async getObject(objectPath: string) {
    const filePath = localObjectPath(objectPath);
    try {
      const body = await readFile(filePath);
      const extension = path.extname(filePath).toLowerCase();
      const contentType = extension === ".png" ? "image/png" : extension === ".webp" ? "image/webp" : extension === ".heic" ? "image/heic" : "image/jpeg";
      return { body, contentType };
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
  const publicBase = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  return publicBase ? `${publicBase}/${safeObjectPath(objectPath)}` : `/api/public/galleries/media?key=${encodeURIComponent(safeObjectPath(objectPath))}`;
}

class VercelBlobStorage implements GalleryStorage {
  async putObject(input: { path: string; body: Buffer | Uint8Array; contentType: string }) {
    const body = Buffer.isBuffer(input.body) ? input.body : Buffer.from(input.body);
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) throw new Error("Vercel Blob storage is not configured.");
    const blob = await put(input.path, body, { access: "public", addRandomSuffix: false, contentType: input.contentType, token });
    return { path: blob.pathname, url: blob.url, size: body.byteLength, contentType: input.contentType };
  }
  async deleteObject(pathOrUrl: string) { await del(pathOrUrl, { token: process.env.BLOB_READ_WRITE_TOKEN }); }
  async getObject(objectPath: string) {
    const response = await fetch(objectPath, { cache: "no-store" });
    if (!response.ok) return null;
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
    const objectPath = pathOrUrl.startsWith("http") ? decodeURIComponent(new URL(pathOrUrl).pathname.split("/objects/")[1] || "") : pathOrUrl;
    if (!objectPath) return;
    const { token } = getR2Config();
    const response = await fetch(r2ObjectUrl(objectPath), { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok && response.status !== 404) throw new Error(`R2 delete failed (${response.status}).`);
  }
  async getObject(objectPath: string) {
    const { token } = getR2Config();
    const response = await fetch(r2ObjectUrl(objectPath), { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
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
