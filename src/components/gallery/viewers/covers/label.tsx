'use client';

import React from 'react';
import { GalleryMedia } from '../media';
import { getGalleryFontStack, type GalleryThemeDefinition } from '@/lib/gallery/themes';
import type { CoverRendererProps } from './full-image';

/**
 * Label — image-led composition with a compact title treatment.
 */
export function LabelCover({
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
      <div className="px-6 py-8 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          {/* Label bar — branding + title in a compact strip */}
          <div className="mb-6 flex items-center justify-between gap-4 border-b pb-4" style={{ borderColor: theme.preset.textColor + '22' }}>
            <div className="flex items-center gap-3">
              {showBranding && logoUrl && (
                <img
                  src={logoUrl}
                  alt={studioName || 'Studio logo'}
                  className={`${logoSizeClass} rounded-md object-contain`}
                />
              )}
              {showBranding && studioName && (
                <span
                  className="text-xs font-medium tracking-[0.2em] uppercase"
                  style={{ color: theme.preset.textColor + '99' }}
                >
                  {studioName}
                </span>
              )}
            </div>
            {showTitle && title && (
              <span
                className="text-sm font-medium tracking-[0.15em] uppercase"
                style={{ color: theme.preset.textColor + 'cc' }}
              >
                {title}
              </span>
            )}
          </div>

          {/* Image-led composition */}
          <div
            className="overflow-hidden"
            style={{ borderRadius: theme.preset.borderRadius }}
          >
            <div
              className="relative aspect-[16/10]"
              style={{
                aspectRatio: coverPhoto?.width && coverPhoto?.height
                  ? `${coverPhoto.width} / ${coverPhoto.height}`
                  : '16 / 10',
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

          {/* Description below image */}
          {showDescription && description && (
            <p
              className="mt-4 max-w-2xl text-sm leading-relaxed"
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

export default LabelCover;