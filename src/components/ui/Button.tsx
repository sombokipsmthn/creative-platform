import { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg' | 'icon';
  asChild?: boolean;
}

/**
 * Button component — maps to the global design system.
 * Uses CSS variable-based styling from globals.css so it works in both
 * light and dark mode without relying on Tailwind's non-existent tokens
 * (bg-primary, bg-secondary, bg-destructive, bg-accent).
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className = '',
    variant = 'primary',
    size = 'md',
    asChild = false,
    ...props
  }, ref) => {
    const Comp = asChild ? 'span' : 'button';

    const variantClass = {
      primary:     'ui-button ui-button-primary',
      secondary:   'ui-button ui-button-secondary',
      ghost:       'ui-button ui-button-ghost',
      destructive: 'ui-button ui-button-destructive',
    }[variant];

    const sizeClass = {
      sm:   'ui-button-sm',
      md:   '',
      lg:   'ui-button-lg',
      icon: 'ui-button-icon',
    }[size];

    return (
      <Comp
        className={[variantClass, sizeClass, className].filter(Boolean).join(' ')}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
export default Button;
