'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'secondary' | 'outline';
}

const statusVariantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  active: 'success',
  inactive: 'outline',
  archived: 'secondary',
  draft: 'secondary',
  sent: 'outline',
  viewed: 'outline',
  accepted: 'success',
  declined: 'destructive',
  paid: 'success',
  pending: 'warning',
  overdue: 'destructive',
  completed: 'success',
  published: 'success',
  unpublished: 'secondary',
};

export default function StatusBadge({
  status,
  variant,
}: StatusBadgeProps) {
  const displayLabel = status.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();

  let badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' = 'secondary';
  if (variant === 'danger') badgeVariant = 'destructive';
  else if (variant === 'success' || variant === 'warning' || variant === 'outline' || variant === 'secondary' || variant === 'default') {
    badgeVariant = variant;
  } else {
    badgeVariant = statusVariantMap[status.toLowerCase()] || 'secondary';
  }

  return (
    <Badge variant={badgeVariant} className="capitalize">
      {displayLabel}
    </Badge>
  );
}
