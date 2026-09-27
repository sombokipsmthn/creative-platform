import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
}

/**
 * Card component - a wrapper for the ui-card class.
 * Can be used to create standard, interactive, or stat cards.
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', as: Component = 'div', ...props }, ref) => {
    return React.createElement(
      Component,
      { ref, className: `ui-card ${className}`, ...props },
      children
    );
  }
);

Card.displayName = 'Card';

export { Card };
export default Card;
