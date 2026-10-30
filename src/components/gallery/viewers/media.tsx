'use client';

import Image from 'next/image';

export function GalleryMedia({
  src,
  poster,
  alt,
  mimeType,
  className,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  unoptimized = false,
}: {
  src?: string | null;
  poster?: string | null;
  alt: string;
  mimeType?: string | null;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  unoptimized?: boolean;
}) {
  // Media records can be incomplete while uploads/thumbnails are processing.
  // Never pass an empty, missing, or non-string URL to the browser or Next Image.
  const mediaSrc = typeof src === 'string' ? src.trim() : '';
  const posterSrc = typeof poster === 'string' ? poster.trim() : '';

  if (!mediaSrc) {
    return (
      <div
        role="img"
        aria-label={alt ? `${alt} (preview unavailable)` : 'Media preview unavailable'}
        className={className ?? 'flex h-full min-h-24 w-full items-center justify-center bg-gray-100'}
        style={
          fill
            ? {
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
              }
            : width && height
              ? { width, height }
              : undefined
        }
      >
        <span className="px-3 text-center text-xs text-gray-400">
          Preview unavailable
        </span>
      </div>
    );
  }

  if (mimeType?.startsWith('video/')) {
    return (
      <video
        src={mediaSrc}
        poster={posterSrc || undefined}
        controls
        preload="metadata"
        aria-label={alt}
        width={width}
        height={height}
        className={className}
        style={
          fill
            ? {
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
              }
            : undefined
        }
      />
    );
  }

  // Next Image optimization fetches protected gallery URLs on the server,
  // where the visitor's Better Auth/gallery session cookies are not forwarded.
  // Load same-origin gallery media directly in the browser so its cookies are sent.
  const isProtectedGalleryMedia = mediaSrc.startsWith('/api/public/galleries/media?');

  return (
    <Image
      src={mediaSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      fill={fill}
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized || isProtectedGalleryMedia}
    />
  );
}
