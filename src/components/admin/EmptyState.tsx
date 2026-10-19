'use client';

import * as React from 'react';
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
    <div className="order fade-in-50">
      <div className="">
        {icon}
      </div>
      <h3 className="">{title}</h3>
      <p className="">
        {description}
      </p>
      {action && <div className="">{action}</div>}
    </div>
  );
}
