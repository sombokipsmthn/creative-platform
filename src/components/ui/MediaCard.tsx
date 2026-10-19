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
        <VideoPlayer src={src} className="" />
      ) : (
        <div className="ui-card-image-cover">
          <Image
            src={src}
            alt={alt ?? ''}
            fill
            className=""
            priority
          />
        </div>
      )}
      {caption && (
        <div className="ui-card-media-content">
          <p className="ui-meta">{caption}</p>
        </div>
      )}
    </div>
  );
};

export default MediaCard;
