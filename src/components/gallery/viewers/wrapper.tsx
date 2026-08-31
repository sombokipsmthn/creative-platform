'use client';

import React from 'react';
import { getGalleryTheme, type GalleryThemeId } from '@/lib/gallery/themes';
import { GalleryViewerMinimal } from './viewers/minimal';
import { GalleryViewerEditorial } from './viewers/editorial';
import { GalleryViewerCinematic } from './viewers/cinematic';
import { GalleryViewerMosaic } from './viewers/mosaic';
import { GalleryViewerStory } from './viewers/story';

export interface GalleryPhoto {
  id: string;
  filename: string;
  displayUrl: string;
  thumbnailUrl: string;
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
  const theme = getGalleryTheme(themeId);

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
