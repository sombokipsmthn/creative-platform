import React from 'react';
import { cn } from '@/lib/utils';

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
      default: 'rounded-xl border bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50',
      interactive: 'rounded-xl border bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 transition-colors hover:border-purple-500/50 cursor-pointer',
      stat: 'rounded-xl border bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50',
      image: 'rounded-xl border bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 overflow-hidden'
    }[variant];

    // Build size classes
    const sizeClass = {
      default: '',
      lg: 'p-6',
      xl: 'p-8',
      '2xl': 'p-10',
      '3xl': 'p-12'
    }[size];

    // Build props for the component
    const componentProps = href
      ? { ref, href, className: cn(variantClass, sizeClass, className), ...props }
      : { ref, className: cn(variantClass, sizeClass, className), ...props };

    // Handle image card variant
    if (variant === 'image' && imageSrc) {
      return (
        <Comp {...componentProps}>
          <div className="relative aspect-video overflow-hidden">
            <img
              src={imageSrc}
              alt={imageAlt || ''}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="p-4">
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
            {children}
            {imageCaption && <p className="text-sm text-gray-500 dark:text-gray-400">{imageCaption}</p>}
            {footer}
          </div>
        </Comp>
      );
    }

    // Handle stat card variant
    if (variant === 'stat') {
      return (
        <Comp {...componentProps}>
          {title && <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>}
          {children && <p className="text-2xl font-bold">{children}</p>}
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </Comp>
      );
    }

    // Handle standard and interactive card variants
    return (
      <Comp {...componentProps}>
        {title && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
        {footer && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            {footer}
          </div>
        )}
      </Comp>
    );
  }
);

Card.displayName = 'Card';

// CardHeader
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

// CardTitle
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

// CardDescription
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

// CardContent
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

// CardFooter
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;