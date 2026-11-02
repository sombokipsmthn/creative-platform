'use client';

import React from 'react';
import { getGalleryTheme, type GalleryThemeId, type GalleryThemePreset } from '@/lib/gallery/themes';
import { GalleryViewerMinimal } from './minimal';
import { GalleryViewerEditorial } from './editorial';
import { GalleryViewerCinematic } from './cinematic';
import { GalleryViewerMosaic } from './mosaic';
import { GalleryViewerStory } from './story';

export interface GalleryPhoto {
  id: string;
  filename: string;
  displayUrl: string;
  thumbnailUrl: string;
  mimeType?: string | null;
  width?: number;
  height?: number;
  captureDate?: string;
  sortOrder: number;
  isHidden: boolean;
  isFavorite: boolean;
  isSelected: boolean;
  downloadCount: number;
}

export interface GalleryCollection {
  id: string;
  title: string;
  description?: string;
  photos: GalleryPhoto[];
}

export interface GalleryViewerProps {
  id: string;
  title: string;
  description?: string;
  themeId: GalleryThemeId;
  /** Unsaved theme settings supplied by the design editor for instant preview. */
  themePreset?: Partial<GalleryThemePreset>;
  photos: GalleryPhoto[];
  collections?: GalleryCollection[];
  allowDownloads: boolean;
  allowFavorites: boolean;
  allowSelections: boolean;
  allowComments: boolean;
  isClient?: boolean; // true if viewing as client (readonly), false if creator (editable)
  onPhotoSelect?: (photoId: string) => void;
  onPhotoFavorite?: (photoId: string, isFavorite: boolean) => void;
  onPhotoComment?: (photoId: string, comment: string) => void;
  onPhotoDownload?: (photoId: string, presetId?: string) => void;
}

/**
 * GalleryViewer routes to the correct theme-specific renderer.
 */
export function GalleryViewer({
  id,
  title,
  description,
  themeId,
  themePreset,
  photos,
  collections,
  allowDownloads,
  allowFavorites,
  allowSelections,
  allowComments,
  isClient = true,
  onPhotoSelect,
  onPhotoFavorite,
  onPhotoComment,
  onPhotoDownload,
}: GalleryViewerProps) {
  const baseTheme = getGalleryTheme(themeId);
  const theme = themePreset ? { ...baseTheme, preset: { ...baseTheme.preset, ...themePreset } } : baseTheme;

  const commonProps = {
    id,
    title,
    description,
    theme,
    photos,
    collections,
    allowDownloads,
    allowFavorites,
    allowSelections,
    allowComments,
    isClient,
    onPhotoSelect,
    onPhotoFavorite,
    onPhotoComment,
    onPhotoDownload,
  };

  switch (theme.id) {
    case 'minimal':
      return <GalleryViewerMinimal {...commonProps} />;

    case 'editorial':
      return <GalleryViewerEditorial {...commonProps} />;

    case 'cinematic':
      return <GalleryViewerCinematic {...commonProps} />;

    case 'mosaic':
      return <GalleryViewerMosaic {...commonProps} />;

    case 'story':
      return <GalleryViewerStory {...commonProps} />;

    default:
      return <GalleryViewerMinimal {...commonProps} />;
  }
}

export default GalleryViewer;
