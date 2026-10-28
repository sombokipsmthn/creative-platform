import { describe, expect, it } from "vitest";
import { canAccessGalleryMedia, isValidGalleryMediaKey } from "./media-access";

const standard = {
  owner: false,
  hasSession: false,
  clientVisibility: "all" as const,
  isHidden: false,
  expired: false,
  galleryStatus: "published",
  galleryPublishedAt: new Date(),
  accessPin: null,
  projectPublic: true,
  projectPublishedAt: new Date(),
  portfolioMode: "selected" as const,
  collectionSelection: "inherit" as const,
  photoSelection: "include" as const,
};

describe("gallery media authorization", () => {
  it("rejects traversal, malformed, and empty path segments", () => {
    expect(isValidGalleryMediaKey("galleries/g-1/p-1/display.jpg")).toBe(true);
    expect(isValidGalleryMediaKey("galleries/g-1/../display.jpg")).toBe(false);
    expect(isValidGalleryMediaKey("galleries\\g-1\\display.jpg")).toBe(false);
    expect(isValidGalleryMediaKey("galleries/g-1//display.jpg")).toBe(false);
  });

  it("allows owners but blocks expired galleries and hidden assets for clients", () => {
    expect(canAccessGalleryMedia({ ...standard, owner: true, expired: true })).toBe(true);
    expect(canAccessGalleryMedia({ ...standard, expired: true })).toBe(false);
    expect(canAccessGalleryMedia({ ...standard, hasSession: true, isHidden: true })).toBe(false);
    expect(canAccessGalleryMedia({ ...standard, hasSession: true, galleryStatus: "draft" })).toBe(false);
  });

  it("respects gallery client collection visibility for an authorized session", () => {
    expect(canAccessGalleryMedia({ ...standard, hasSession: true, clientVisibility: "authorized", sessionClientId: null })).toBe(false);
    expect(canAccessGalleryMedia({ ...standard, hasSession: true, clientVisibility: "authorized", sessionClientId: "client-1" })).toBe(true);
    expect(canAccessGalleryMedia({ ...standard, hasSession: true, clientVisibility: "none" })).toBe(false);
  });

  it("only exposes curated media from published, unprotected, unexpired public project galleries", () => {
    expect(canAccessGalleryMedia(standard)).toBe(true);
    expect(canAccessGalleryMedia({ ...standard, photoSelection: "exclude" })).toBe(false);
    expect(canAccessGalleryMedia({ ...standard, galleryStatus: "draft" })).toBe(false);
    expect(canAccessGalleryMedia({ ...standard, accessPin: "hash" })).toBe(false);
    expect(canAccessGalleryMedia({ ...standard, projectPublic: false })).toBe(false);
    expect(canAccessGalleryMedia({ ...standard, isHidden: true })).toBe(false);
  });

  it("requires both gallery and project publication timestamps", () => {
    expect(canAccessGalleryMedia({ ...standard, galleryPublishedAt: null })).toBe(false);
    expect(canAccessGalleryMedia({ ...standard, projectPublishedAt: null })).toBe(false);
  });

  it("prevents client-only collection visibility from becoming public portfolio media", () => {
    expect(canAccessGalleryMedia({ ...standard, clientVisibility: "authorized" })).toBe(false);
    expect(canAccessGalleryMedia({ ...standard, clientVisibility: "guest" })).toBe(false);
  });
});
