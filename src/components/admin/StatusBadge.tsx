'use client';

import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
}

const variantMap: Record<NonNullable<StatusBadgeProps['variant']>, React.ComponentProps<typeof Badge>['variant']> = {
  default: 'secondary',
  success: 'success',
  warning: 'warning',
  danger: 'destructive',
  info: 'secondary',
  accent: 'default',
};

const statusVariantMap: Record<string, StatusBadgeProps['variant']> = {
  active: 'success',
  inactive: 'warning',
  archived: 'default',
  draft: 'default',
  sent: 'info',
  viewed: 'info',
  accepted: 'success',
  declined: 'danger',
  paid: 'success',
  pending: 'warning',
  overdue: 'danger',
  completed: 'success',
  published: 'success',
  unpublished: 'default',
};

export default function StatusBadge({
  status,
  variant,
}: StatusBadgeProps) {
  const displayVariant = variant || statusVariantMap[status.toLowerCase()] || 'default';
  const displayLabel = status.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();

  return (
    <Badge variant={variantMap[displayVariant] ?? 'secondary'}>
      {displayLabel}
    </Badge>
  );
}