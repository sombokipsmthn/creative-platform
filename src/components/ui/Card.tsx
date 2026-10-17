import React from 'react';

type CardVariant = 'default' | 'interactive' | 'stat' | 'image';
type CardSize = 'default' | 'lg' | 'xl' | '2xl' | '3xl';

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  variant?: CardVariant;
  size?: CardSize;
  href?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
}

/**
 * Card component - implements the design system's card variants.
 * Supports standard, interactive, stat, and image cards.
 */
const Card = React.forwardRef<HTMLDivElement | HTMLAnchorElement, CardProps>(
  ({
    children,
    className = '',
    as: Component = 'div',
    variant = 'default',
    size = 'default',
    href,
    title,
    subtitle,
    footer,
    imageSrc,
    imageAlt,
    imageCaption,
    ...props
  }, ref) => {
    // Determine the component type based on href
    const Comp = href ? 'a' : (Component as React.ElementType);

    // Build variant classes
    const variantClass = {
      default: 'ui-card',
      interactive: 'ui-card ui-card-interactive',
      stat: 'ui-stat-card',
      image: 'ui-card ui-card-image'
    }[variant];

    // Build size classes
    const sizeClass = {
      default: '',
      lg: 'ui-card-lg',
      xl: 'ui-card-xl',
      '2xl': 'ui-card-2xl',
      '3xl': 'ui-card-3xl'
    }[size];

    // Build props for the component
    const componentProps = href
      ? { ref, href, className: `${variantClass} ${sizeClass} ${className}`, ...props }
      : { ref, className: `${variantClass} ${sizeClass} ${className}`, ...props };

    // Handle image card variant
    if (variant === 'image' && imageSrc) {
      return (
        <Comp {...componentProps}>
          <div className="ui-card-image-cover relative">
            <img
              src={imageSrc}
              alt={imageAlt || ''}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="ui-card-image-content">
            {title && <h3 className="ui-card-title">{title}</h3>}
            {subtitle && <p className="ui-meta">{subtitle}</p>}
            {children}
            {imageCaption && <p className="ui-meta">{imageCaption}</p>}
            {footer}
          </div>
        </Comp>
      );
    }

    // Handle stat card variant
    if (variant === 'stat') {
      return (
        <Comp {...componentProps}>
          {title && <p className="ui-stat-label">{title}</p>}
          {children && <p className="ui-stat-value">{children}</p>}
          {subtitle && <p className="ui-stat-detail">{subtitle}</p>}
        </Comp>
      );
    }

    // Handle standard and interactive card variants
    return (
      <Comp {...componentProps}>
        {title && (
          <div className="ui-card-header">
            <h3 className="ui-card-title">{title}</h3>
            {subtitle && <p className="ui-meta">{subtitle}</p>}
          </div>
        )}
        <div className="ui-card-content">
          {children}
        </div>
        {footer && (
          <div className="ui-card-footer">
            {footer}
          </div>
        )}
      </Comp>
    );
  }
);

Card.displayName = 'Card';

export { Card };
export default Card;
