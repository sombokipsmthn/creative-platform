// Upload pathname and filename validation helpers are kept separate from the route
// so unit tests do not initialize the production database or upload dependencies.
export function isPathSafe(pathname: string): boolean {
  if (!pathname || pathname.startsWith("/") || pathname.includes("\\") || /[\u0000-\u001f]/.test(pathname)) return false;
  if (pathname.split("/").some((part) => !part || part === "." || part === "..")) return false;
  if (/\s/.test(pathname)) return false;
  return true;
}

export function sanitizeFilename(filename: string): string {
  if (!filename) return "media";

  let cleaned = filename
    .replace(/[<>:"|?*\\]/g, "_")
    .replace(/\/+/g, "/")
    .replace(/\.\./g, "");

  cleaned = cleaned.replace(/^\/+/, "").replace(/\/+$/, "");
  cleaned = cleaned.replace(/^\.+/, "").replace(/\.+$/, "");

  if (!cleaned || /^\.+$/.test(cleaned)) return "media";
  return cleaned.length > 200 ? cleaned.slice(0, 200) : cleaned;
}

export const MAX_GALLERY_MEDIA_BYTES = 100 * 1024 * 1024;
export const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
export const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska", "video/webm", "video/x-flv", "video/x-ms-wmv"]);

export function validateGalleryMedia(filename: string, mimeType: string, size: number) {
  if (size <= 0 || size > MAX_GALLERY_MEDIA_BYTES) return { valid: false, status: 413, error: "Each file must be between 1 byte and 100MB." } as const;
  if ((!IMAGE_MIME_TYPES.has(mimeType.toLowerCase()) && !VIDEO_MIME_TYPES.has(mimeType.toLowerCase())) || !validateMimeTypeByExtension(filename, mimeType)) {
    return { valid: false, status: 415, error: "Unsupported media type. Use JPEG, PNG, WebP, HEIC, HEIF, or a supported video format." } as const;
  }
  return { valid: true } as const;
}

export function validateMimeTypeByExtension(
  filename: string,
  mimeType: string,
): boolean {
  const ext = filename.toLowerCase().split(".").pop() || "";
  const mime = mimeType.toLowerCase();
  const map: Record<string, string[]> = {
    jpg: ["image/jpeg"],
    jpeg: ["image/jpeg"],
    png: ["image/png"],
    webp: ["image/webp"],
    heic: ["image/heic"],
    heif: ["image/heif"],
    mp4: ["video/mp4"],
    mov: ["video/quicktime"],
    avi: ["video/x-msvideo"],
    mkv: ["video/x-matroska"],
    webm: ["video/webm"],
    flv: ["video/x-flv"],
    wmv: ["video/x-ms-wmv"],
  };

  return map[ext]?.includes(mime) ?? false;
}
