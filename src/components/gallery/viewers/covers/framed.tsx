'use client';

import React from 'react';
import { GalleryMedia } from '../media';
import { getGalleryFontStack, type GalleryThemeDefinition } from '@/lib/gallery/themes';
import type { CoverRendererProps } from './full-image';

/**
 * Framed — photograph inside a frame with surrounding space.
 */
export function FramedCover({
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
      <div className="px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          {/* Framed photograph */}
          <div
            className="relative overflow-hidden border-4 shadow-xl"
            style={{
              borderColor: theme.preset.textColor + '1a',
              borderRadius: theme.preset.borderRadius,
            }}
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

          {/* Title + description below frame */}
          <div className="mt-8 text-center">
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
                className="mt-3 max-w-xl text-base leading-relaxed"
                style={{ color: theme.preset.textColor + '99' }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Branding */}
      {showBranding && (studioName || logoUrl) && (
        <div className="px-6 pb-8 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-5xl flex items-center gap-3">
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
        </div>
      )}
    </div>
  );
}

export default FramedCover;