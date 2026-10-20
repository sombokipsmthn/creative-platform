import React from 'react';

type InputVariant = 'default' | 'underlined' | 'filled';
type InputSize = 'sm' | 'md' | 'lg';
type InputState = 'default' | 'focus' | 'disabled' | 'error';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  className?: string;
  asChild?: boolean;
  variant?: InputVariant;
  size?: InputSize;
  state?: InputState;
  placeholder?: string;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  asChild?: boolean;
  variant?: InputVariant;
  size?: InputSize;
  state?: InputState;
  placeholder?: string;
  rows?: number;
}

/**
 * Input component - implements the design system's input variants.
 * Supports default, underlined, and filled variants with all states.
 */
const Input = React.forwardRef<
  HTMLInputElement | HTMLSpanElement,
  InputProps
>(({ className = '', asChild = false, variant = 'default', size = 'md', state = 'default', placeholder, ...props }, ref) => {
  const Component = asChild ? 'span' : 'input';

  // Build variant classes
  const variantClass = {
    default: 'ui-input',
    underlined: 'ui-input ui-input-underlined',
    filled: 'ui-input ui-input-filled'
  }[variant];

  // Build size classes
  const sizeClass = {
    sm: 'ui-input-sm',
    md: '',
    lg: 'ui-input-lg'
  }[size];

  // Build state classes
  const stateClass = {
    default: '',
    focus: 'ui-input-focus',
    disabled: 'ui-input-disabled',
    error: 'ui-input-error'
  }[state];

  return (
    React.createElement(Component, {
      ref,
      className: [`${variantClass}`, `${sizeClass}`, `${stateClass}`, className]
        .filter(Boolean)
        .join(' '),
      placeholder,
      ...props
    })
  );
});

Input.displayName = 'Input';

/**
 * Textarea component - implements the design system's textarea variants.
 */
const Textarea = React.forwardRef<
  HTMLTextAreaElement | HTMLSpanElement,
  TextareaProps
>(({ className = '', asChild = false, variant = 'default', size = 'md', state = 'default', placeholder, rows, ...props }, ref) => {
  const Component = asChild ? 'span' : 'textarea';

  // Build variant classes
  const variantClass = {
    default: 'ui-textarea',
    underlined: 'ui-textarea ui-textarea-underlined',
    filled: 'ui-textarea ui-textarea-filled'
  }[variant];

  // Build size classes
  const sizeClass = {
    sm: 'ui-textarea-sm',
    md: '',
    lg: 'ui-textarea-lg'
  }[size];

  // Build state classes
  const stateClass = {
    default: '',
    focus: 'ui-textarea-focus',
    disabled: 'ui-textarea-disabled',
    error: 'ui-textarea-error'
  }[state];

  return (
    React.createElement(Component, {
      ref,
      className: [`${variantClass}`, `${sizeClass}`, `${stateClass}`, className]
        .filter(Boolean)
        .join(' '),
      placeholder,
      rows,
      ...props
    })
  );
});

Textarea.displayName = 'Textarea';

export { Input, Textarea };
export default Input;
