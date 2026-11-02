'use client';

import React from 'react';
import { GalleryMedia } from '../media';
import { getGalleryFontStack, type GalleryThemeDefinition } from '@/lib/gallery/themes';
import type { CoverRendererProps } from './full-image';

/**
 * Centered — centred title and carefully positioned photograph.
 */
export function CenteredCover({
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
      <div className="flex min-h-[70vh] flex-col items-center px-6 py-12 text-center sm:px-10 lg:px-16">
        {showBranding && (studioName || logoUrl) && (
          <div className="mb-10 flex items-center gap-3">
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

        {/* Centered photograph */}
        <div
          className="w-full max-w-2xl overflow-hidden"
          style={{ borderRadius: theme.preset.borderRadius }}
        >
          <div
            className="relative aspect-[4/3]"
            style={{
              aspectRatio: coverPhoto?.width && coverPhoto?.height
                ? `${coverPhoto.width} / ${coverPhoto.height}`
                : '4 / 3',
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

        {/* Title + description below image */}
        <div className="mt-10">
          {showTitle && title && (
            <h1
              className="text-3xl font-light tracking-tight sm:text-4xl"
              style={{ color: theme.preset.textColor }}
            >
              {title}
            </h1>
          )}
          {showDescription && description && (
            <p
              className="mt-3 max-w-lg text-base leading-relaxed"
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

export default CenteredCover;