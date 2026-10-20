'use client';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
}

const variantMap = {
  default: 'ui-badge',
  success: 'ui-badge ui-badge-success',
  warning: 'ui-badge ui-badge-warning',
  danger: 'ui-badge ui-badge-danger',
  info: 'ui-badge ui-badge-info',
  accent: 'ui-badge ui-badge-accent',
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
    <span className={variantMap[displayVariant]}>
      <span className="ui-badge-dot" />
      {displayLabel}
    </span>
  );
}
