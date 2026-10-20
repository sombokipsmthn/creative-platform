import Image from 'next/image';

interface ImageCardProps {
  src: string;
  alt?: string;
  caption?: string;
  href?: string;
  className?: string;
}

/**
 * ImageCard component - a variant of the ui-card for displaying images.
 * Uses the ui-card-image-cover and ui-card-image-content classes from globals.css.
 */
export default function ImageCard({
  src,
  alt = '',
  caption,
  href,
  className = '',
}: ImageCardProps) {
  return (
    <div className={`ui-card ui-card-image ${className}`}>
      {href ? (
        <a href={href} className="block">
          <div className="ui-card-image-cover relative">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover"
              priority
            />
          </div>
        </a>
      ) : (
        <div className="ui-card-image-cover relative">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      <div className="ui-card-image-content">
        {caption && <p className="ui-meta">{caption}</p>}
      </div>
    </div>
  );
}
