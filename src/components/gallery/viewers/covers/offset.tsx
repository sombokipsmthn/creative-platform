'use client';

import React from 'react';
import { GalleryMedia } from '../media';
import { getGalleryFontStack, type GalleryThemeDefinition } from '@/lib/gallery/themes';
import type { CoverRendererProps } from './full-image';

/**
 * Offset — asymmetric editorial composition.
 */
export function OffsetCover({
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
    logoSize === 'small' ? 'h-6 w-6' :
    logoSize === 'large' ? 'h-12 w-12' : 'h-9 w-9';

  return (
    <div className={className} style={bgStyle}>
      <div className="relative min-h-[70vh] px-6 py-12 sm:px-10 lg:px-16">
        {/* Offset image — shifted right with generous margin */}
        <div
          className="relative ml-auto w-full max-w-3xl overflow-hidden"
          style={{ borderRadius: theme.preset.borderRadius }}
        >
          <div
            className="relative aspect-[4/5]"
            style={{
              aspectRatio: coverPhoto?.width && coverPhoto?.height
                ? `${coverPhoto.width} / ${coverPhoto.height}`
                : '4 / 5',
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

        {/* Offset text — shifted left, overlapping the image's negative space */}
        <div className="absolute left-6 top-1/2 max-w-xs -translate-y-1/2 sm:left-10">
          {showBranding && (studioName || logoUrl) && (
            <div className="mb-6 flex items-center gap-3">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={studioName || 'Studio logo'}
                  className={`${logoSizeClass} rounded-md object-contain`}
                />
              )}
              {studioName && (
                <span
                  className="text-sm font-medium tracking-wide"
                  style={{ color: theme.preset.textColor + '99' }}
                >
                  {studioName}
                </span>
              )}
            </div>
          )}
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
              className="mt-4 max-w-xs text-base leading-relaxed"
              style={{ color: theme.preset.textColor + '99' }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default OffsetCover;