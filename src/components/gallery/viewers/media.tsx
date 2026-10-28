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
  src: string;
  poster?: string;
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
  if (mimeType?.startsWith('video/')) {
    return <video src={src} poster={poster} controls preload="metadata" aria-label={alt} width={width} height={height} className={className} style={fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%' } : undefined} />;
  }
  return <Image src={src} alt={alt} className={className} width={width} height={height} fill={fill} sizes={sizes} priority={priority} unoptimized={unoptimized} />;
}
