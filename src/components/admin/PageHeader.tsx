'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps { backLink?: string; backLabel?: string; title: string; description?: string; primaryAction?: ReactNode; secondaryActions?: ReactNode }
export default function PageHeader({ backLink, backLabel = 'Back', title, description, primaryAction, secondaryActions }: PageHeaderProps) {
  return <header className="admin-page-header">
    {backLink && <Link href={backLink} className="admin-breadcrumb"><ChevronLeft aria-hidden="true" />{backLabel}</Link>}
    <div className="admin-page-header__row"><div className="min-w-0"><h1 className={cn('admin-page-title')}>{title}</h1>{description && <p className="admin-page-description">{description}</p>}</div><div className="admin-page-actions">{secondaryActions}{primaryAction}</div></div>
  </header>;
}
