'use client';

import React, { useState } from 'react';
import { GalleryMedia } from './media';
import { Download, Heart } from "@phosphor-icons/react";
import { Button } from '@/components/ui/button';
import type { GalleryViewerProps } from './wrapper';
import { getGalleryFontStack, type GalleryThemeDefinition } from '@/lib/gallery/themes';
import { GalleryCoverRenderer, type CoverPhoto } from './covers';

interface SmallColumnsViewerProps extends Omit<GalleryViewerProps, 'themeId'> {
  theme: GalleryThemeDefinition;
}

/**
 * Small Columns Viewer — PRIMARY KIPSMTHN gallery layout.
 *
 * Elegant, relatively small image thumbnails arranged in a balanced
 * masonry-style grid. Four or five columns on wide desktop screens,
 * responsive column counts on smaller screens. Preserves original image
 * proportions and the photographer's intended image order.
 */
export function GalleryViewerSmallColumns({
  title,
  description,
  theme,
  photos,
  collections,
  allowDownloads,
  allowFavorites,
  allowSelections,
  onPhotoSelect,
  onPhotoFavorite,
  onPhotoDownload,
}: SmallColumnsViewerProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  if (photos.length === 0) {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-6"
        style={{
          backgroundColor: theme.preset.backgroundColor,
          color: theme.preset.textColor,
          fontFamily: getGalleryFontStack(theme.preset.fontFamily),
        }}
      >
        <div className="text-center">
          <p className="text-lg font-light opacity-60">No photos in gallery</p>
        </div>
      </div>
    );
  }

  const handleFavorite = (photoId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(photoId)) {
      newFavorites.delete(photoId);
    } else {
      newFavorites.add(photoId);
    }
    setFavorites(newFavorites);
    onPhotoFavorite?.(photoId, newFavorites.has(photoId));
  };

  const handleSelect = (photoId: string) => {
    onPhotoSelect?.(photoId);
  };

  // Column count from theme, clamped to a sensible range.
  const columns = Math.max(2, Math.min(6, theme.preset.masonryColumns || 4));

  // Spacing map — tight / comfortable / spacious.
  const gapClass =
    theme.preset.gridSpacing === 'tight' ? 'gap-2' :
    theme.preset.gridSpacing === 'wide' ? 'gap-5' : 'gap-3';

  // Thumbnail sizing — small / regular / large.
  const sizingClass =
    theme.preset.thumbnailSize === 'small' ? 'max-h-48' :
    theme.preset.thumbnailSize === 'large' ? 'max-h-96' : 'max-h-72';

  // Gallery width — focused / wide / full.
  const widthClass =
    theme.preset.galleryWidth === 'full' ? 'max-w-full' :
    theme.preset.galleryWidth === 'wide' ? 'max-w-7xl' : 'max-w-6xl';

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: theme.preset.backgroundColor,
        color: theme.preset.textColor,
        fontFamily: getGalleryFontStack(theme.preset.fontFamily),
      }}
    >
      {/* Header */}
      <div className="px-6 py-10 sm:px-10 lg:px-16">
        <h1 className="text-3xl font-light tracking-tight sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-base leading-relaxed opacity-75">
            {description}
          </p>
        )}
      </div>

      {/* Cover */}
      <GalleryCoverRenderer
        theme={theme}
        composition={theme.preset.coverComposition as any}
        coverPhoto={photos[0] ? {
          id: photos[0].id,
          filename: photos[0].filename,
          displayUrl: photos[0].displayUrl,
          thumbnailUrl: photos[0].thumbnailUrl,
          mimeType: photos[0].mimeType,
          width: photos[0].width,
          height: photos[0].height,
        } : null}
        title={title}
        description={description}
        focalX={theme.preset.coverFocalX}
        focalY={theme.preset.coverFocalY}
        overlayOpacity={theme.preset.coverOverlayOpacity}
        showTitle={theme.preset.showTitle}
        showDescription={theme.preset.showDescription}
        showBranding={theme.preset.coverBrandingVisible ?? true}
        studioName={theme.preset.studioName}
        logoUrl={theme.preset.logoLightUrl || theme.preset.logoUrl}
        logoLightUrl={theme.preset.logoLightUrl}
        logoDarkUrl={theme.preset.logoDarkUrl}
        logoTransparentUrl={theme.preset.logoTransparentUrl}
        logoSize={theme.preset.logoSize}
        brandColor={theme.preset.brandColor}
      />

      {/* Masonry Grid */}
      <div className={`mx-auto ${widthClass} px-6 pb-20 sm:px-10 lg:px-16`}>
        <div
          className="columns-2 sm:columns-3 md:columns-4 lg:columns-5"
          style={{ columnGap: theme.preset.gridSpacing === 'tight' ? 8 : theme.preset.gridSpacing === 'wide' ? 24 : 16 }}
        >
          {photos.map((photo) => {
            const isFavorite = favorites.has(photo.id) || photo.isFavorite;
            return (
              <figure
                key={photo.id}
                className="mb-4 break-inside-avoid overflow-hidden"
                style={{ borderRadius: theme.preset.borderRadius }}
              >
                <div
                  className="relative w-full cursor-pointer group"
                  style={{ aspectRatio: photo.width && photo.height ? `${photo.width} / ${photo.height}` : '3 / 2' }}
                  onClick={() => handleSelect(photo.id)}
                >
                  <GalleryMedia
                    src={photo.displayUrl}
                    poster={photo.thumbnailUrl}
                    mimeType={photo.mimeType}
                    alt={photo.filename}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="flex-1 truncate text-xs font-light text-white">
                      {photo.filename}
                    </p>
                    <div className="ml-2 flex gap-2">
                      {allowFavorites && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleFavorite(photo.id); }}
                          className="rounded-full bg-white/20 p-1.5 backdrop-blur transition hover:bg-white/30"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
                            }`}
                          />
                        </Button>
                      )}
                      {allowDownloads && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); onPhotoDownload?.(photo.id); }}
                          className="rounded-full bg-white/20 p-1.5 backdrop-blur transition hover:bg-white/30"
                        >
                          <Download className="h-4 w-4 text-white" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default GalleryViewerSmallColumns;