import { describe, expect, it } from "vitest";
import { isClientPhotoVisible, isPortfolioPhotoIncluded } from "./gallery-curation";

describe("gallery portfolio curation precedence", () => {
  it("publishes an entire gallery by default", () => {
    expect(isPortfolioPhotoIncluded("all", "inherit", "inherit")).toBe(true);
  });

  it("publishes selected sets when the gallery is selected", () => {
    expect(isPortfolioPhotoIncluded("selected", "include", "inherit")).toBe(true);
    expect(isPortfolioPhotoIncluded("selected", "inherit", "inherit")).toBe(false);
  });

  it("lets individual media override the gallery and set", () => {
    expect(isPortfolioPhotoIncluded("none", "inherit", "include")).toBe(true);
    expect(isPortfolioPhotoIncluded("all", "include", "exclude")).toBe(false);
    expect(isPortfolioPhotoIncluded("selected", "include", "exclude")).toBe(false);
    expect(isPortfolioPhotoIncluded("all", "exclude", "include")).toBe(true);
  });

  it("keeps client visibility independent from portfolio visibility", () => {
    expect(isClientPhotoVisible("all", null)).toBe(true);
    expect(isClientPhotoVisible("authorized", null)).toBe(false);
    expect(isClientPhotoVisible("authorized", "client-1")).toBe(true);
    expect(isClientPhotoVisible("guest", null)).toBe(true);
    expect(isClientPhotoVisible("guest", "client-1")).toBe(false);
    expect(isClientPhotoVisible("none", "client-1")).toBe(false);
  });
});
