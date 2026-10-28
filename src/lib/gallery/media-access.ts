import { isClientPhotoVisible, isPortfolioPhotoIncluded, type PortfolioMode, type SelectionOverride } from "@/lib/portfolio/gallery-curation";

export function galleryMediaProxyUrl(objectPath: string | null | undefined) {
  return objectPath ? `/api/public/galleries/media?key=${encodeURIComponent(objectPath)}` : "";
}

export function isValidGalleryMediaKey(key: string) {
  return key.startsWith("galleries/") && !key.startsWith("/") && !key.includes("\\") && !key.split("/").some((part) => !part || part === "." || part === "..") && !/[\u0000-\u001f]/.test(key);
}

export function canAccessGalleryMedia(input: {
  owner: boolean;
  hasSession: boolean;
  sessionClientId?: string | null;
  clientVisibility: "all" | "authorized" | "guest" | "none";
  isHidden: boolean;
  expired: boolean;
  galleryStatus: string;
  galleryPublishedAt: Date | string | null;
  accessPin: string | null;
  projectPublic: boolean;
  projectPublishedAt: Date | string | null;
  portfolioMode: PortfolioMode;
  collectionSelection: SelectionOverride | null;
  photoSelection: SelectionOverride | null;
}) {
  if (input.owner) return true;
  if (input.expired) return false;
  if (input.hasSession && input.galleryStatus === "published" && input.galleryPublishedAt && !input.isHidden && isClientPhotoVisible(input.clientVisibility, input.sessionClientId ?? null)) return true;
  if (input.isHidden || input.galleryStatus !== "published" || !input.galleryPublishedAt || input.accessPin) return false;
  if (!input.projectPublic || !input.projectPublishedAt || input.clientVisibility !== "all") return false;
  return isPortfolioPhotoIncluded(input.portfolioMode, input.collectionSelection, input.photoSelection);
}
