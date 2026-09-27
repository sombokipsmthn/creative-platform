import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  asChild?: boolean;
}

/**
 * Input component - a wrapper for the ui-input class.
 * Can be used as a standard input or as a child component (via asChild).
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', asChild = false, ...props }, ref) => {
    const Component = asChild ? 'span' : 'input';
    return React.createElement(
      Component,
      { ref, className: `ui-input ${className}`, ...props }
    );
  }
);

Input.displayName = 'Input';

export { Input };
export default Input;
