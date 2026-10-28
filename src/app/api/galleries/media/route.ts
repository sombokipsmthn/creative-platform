import { GET as getAuthorizedGalleryMedia } from "@/app/api/public/galleries/media/route";

export const dynamic = "force-dynamic";

// Preserve existing media URLs while sharing the same per-object authorization
// rules as the public gallery media endpoint.
export async function GET(request: Request) {
  return getAuthorizedGalleryMedia(request);
}
