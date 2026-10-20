'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="ui-empty-state">
      <div className="ui-empty-icon">{icon}</div>
      <h3 className="ui-section-title">{title}</h3>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-xs">
        {description}
      </p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
