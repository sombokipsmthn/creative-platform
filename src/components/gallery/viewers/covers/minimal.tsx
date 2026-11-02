'use client';

import React from 'react';
import { GalleryMedia } from '../media';
import { getGalleryFontStack, type GalleryThemeDefinition } from '@/lib/gallery/themes';
import type { CoverRendererProps } from './full-image';

/**
 * Minimal — restrained typography and strong photography.
 */
export function MinimalCover({
  theme,
  coverPhoto,
  title,
  description,
  focalX = 50,
  focalY = 50,
  showTitle = true,
  showDescription = true,
  showBranding = true,
  studioName,
  logoUrl,
  logoSize = 'medium',
  brandColor = '#000000',
  className,
}: CoverRendererProps) {
  const bgStyle = {
    backgroundColor: theme.preset.backgroundColor,
    color: theme.preset.textColor,
    fontFamily: getGalleryFontStack(theme.preset.fontFamily),
  };

  const logoSizeClass =
    logoSize === 'small' ? 'h-5 w-5' :
    logoSize === 'large' ? 'h-10 w-10' : 'h-7 w-7';

  return (
    <div className={className} style={bgStyle}>
      <div className="px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          {/* Top row: branding */}
          <div className="mb-12 flex items-center justify-between">
            {showBranding && (studioName || logoUrl) ? (
              <div className="flex items-center gap-3">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt={studioName || 'Studio logo'}
                    className={`${logoSizeClass} rounded-md object-contain`}
                  />
                )}
                {studioName && (
                  <span
                    className="text-xs font-medium tracking-[0.2em] uppercase"
                    style={{ color: theme.preset.textColor + '99' }}
                  >
                    {studioName}
                  </span>
                )}
              </div>
            ) : (
              <div />
            )}
          </div>

          {/* Large photograph */}
          <div
            className="overflow-hidden"
            style={{ borderRadius: theme.preset.borderRadius }}
          >
            <div
              className="relative aspect-[16/9]"
              style={{
                aspectRatio: coverPhoto?.width && coverPhoto?.height
                  ? `${coverPhoto.width} / ${coverPhoto.height}`
                  : '16 / 9',
              }}
            >
              {coverPhoto ? (
                <GalleryMedia
                  src={coverPhoto.displayUrl}
                  poster={coverPhoto.thumbnailUrl}
                  alt={coverPhoto.filename}
                  fill
                  unoptimized
                  className="object-cover"
                  style={{
                    objectPosition: `${focalX}% ${focalY}%`,
                  }}
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: theme.preset.textColor + '11' }}
                />
              )}
            </div>
          </div>

          {/* Title + description below, restrained */}
          <div className="mt-10">
            {showTitle && title && (
              <h1
                className="text-4xl font-light tracking-tight sm:text-5xl"
                style={{ color: theme.preset.textColor }}
              >
                {title}
              </h1>
            )}
            {showDescription && description && (
              <p
                className="mt-4 max-w-xl text-base leading-relaxed"
                style={{ color: theme.preset.textColor + '99' }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MinimalCover;