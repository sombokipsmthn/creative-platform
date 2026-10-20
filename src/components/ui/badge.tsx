import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

const badgeVariants = cva('inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap', {
  variants: {
    variant: {
      default: 'bg-purple-600 text-white',
      success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
      warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
      secondary: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
      destructive: 'bg-red-500/10 text-red-700 dark:text-red-300',
      outline: 'border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300',
      ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
      link: 'text-purple-600 underline-offset-4 hover:underline',
    },
  },
  defaultVariants: { variant: 'default' },
});

function Badge({ className, variant = 'default', asChild = false, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
