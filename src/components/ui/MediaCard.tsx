import React from 'react';
import Image from 'next/image';
import VideoPlayer from './VideoPlayer';

interface MediaCardProps {
  src: string;
  type: 'image' | 'video';
  alt?: string;
  caption?: string;
  href?: string;
  className?: string;
}

const MediaCard: React.FC<MediaCardProps> = ({ src, type, alt, caption, href, className }) => {
  const isVideo = type === 'video';

  return (
    <div className={`ui-card ui-card-media ${className}`}>
      {isVideo ? (
        <VideoPlayer src={src} className="w-full h-auto rounded-lg shadow-lg" />
      ) : (
        <div className="ui-card-image-cover relative">
          <Image
            src={src}
            alt={alt ?? ''}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      {caption && (
        <div className="ui-card-media-content mt-2">
          <p className="ui-meta">{caption}</p>
        </div>
      )}
    </div>
  );
};

export default MediaCard;
