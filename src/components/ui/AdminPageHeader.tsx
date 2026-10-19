'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';

interface AdminPageHeaderTab {
  label: string;
  href?: string;
  onClick?: () => void;
  active: boolean;
  disabled?: boolean;
}

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: {
    label: string;
    href: string;
  };
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode[];
  tabs?: AdminPageHeaderTab[];
  className?: string;
}

export function AdminPageHeader({
  title,
  description,
  breadcrumb,
  primaryAction,
  secondaryActions,
  tabs,
  className = '',
}: AdminPageHeaderProps) {
  return (
    <div className={cn(' pb-5 mb-8 space-y-4', className)}>
      {breadcrumb && (
        <Link
          href={breadcrumb.href}
          className=""
        >
          <ChevronLeft className="" />
          {breadcrumb.label}
        </Link>
      )}

      <div className="">
        <div className="">
          <h1 className="">
            {title}
          </h1>
          {description && (
            <p className="">
              {description}
            </p>
          )}
        </div>

        <div className="">
          {secondaryActions?.map((action, i) => (
            <div key={i}>{action}</div>
          ))}
          {primaryAction && <div>{primaryAction}</div>}
        </div>
      </div>

      {tabs && tabs.length > 0 && (
        <div className="">
          {tabs.map((tab) => {
            const isActive = tab.active;
            const tabClasses = cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap',
              isActive
                ? 'bg-secondary text-secondary-foreground font-semibold shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              tab.disabled && 'pointer-events-none opacity-50'
            );

            if (tab.href) {
              return (
                <Link key={tab.label} href={tab.href} className={tabClasses}>
                  {tab.label}
                </Link>
              );
            }

            return (
              <button
                key={tab.label}
                type="button"
                onClick={tab.onClick}
                disabled={tab.disabled}
                className={tabClasses}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminPageHeader;
