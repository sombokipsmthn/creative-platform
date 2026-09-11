'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface PageHeaderProps {
  backLink?: string;
  backLabel?: string;
  title: string;
  description?: string;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
}

export default function PageHeader({
  backLink,
  backLabel = '← Back',
  title,
  description,
  primaryAction,
  secondaryActions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-6 border-b ui-divider pb-6">
      {backLink && (
        <Link href={backLink} className="ui-meta uppercase tracking-widest hover:text-[var(--color-accent)]">
          {backLabel}
        </Link>
      )}
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="ui-page-title">{title}</h1>
          {description && (
            <p className="ui-meta mt-2">{description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3 flex-wrap md:justify-end">
          {secondaryActions && <>{secondaryActions}</>}
          {primaryAction}
        </div>
      </div>
    </div>
  );
}
