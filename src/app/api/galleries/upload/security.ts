// Upload pathname and filename validation helpers are kept separate from the route
// so unit tests do not initialize the production database or upload dependencies.
export function isPathSafe(pathname: string): boolean {
  if (pathname.startsWith("/")) return false;
  if (pathname.includes("..")) return false;
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
