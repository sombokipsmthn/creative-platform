'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
    <header className={`mb-6 min-w-0 w-full border-b border-border pb-6 sm:mb-8 ${className}`}>
      <div className="flex w-full min-w-0 flex-col gap-5">
        <div className="flex w-full min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
          <div className="mb-1 min-w-0 flex-1 md:mb-0">
            {breadcrumb && (
              <Link
                href={breadcrumb.href}
                className="mb-1 inline-flex min-h-7 items-center rounded-sm text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                ← {breadcrumb.label}
              </Link>
            )}
            <h1 className="w-full break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 w-full max-w-2xl break-words text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          {(primaryAction || (secondaryActions && secondaryActions.length > 0)) && (
            <div className="flex w-full min-w-0 max-w-full flex-wrap gap-2 md:w-auto md:justify-end">
              {primaryAction && (
                <div className="flex min-w-0 max-w-full flex-wrap">{primaryAction}</div>
              )}
              {secondaryActions?.map((action, index) => (
                <div key={index} className="flex-shrink-0">
                  {action}
                </div>
              ))}
            </div>
          )}
        </div>

        {tabs && tabs.length > 0 && (
          <nav className="admin-tabs w-full min-w-0" aria-label="Page sections" role="tablist">
            {tabs.map((tab) => {
              const isActive = tab.active ?? false;
              const isDisabled = tab.disabled ?? false;
              const tabClassName = 'admin-tab focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

              if (tab.onClick) {
                return (
                  <button
                    key={tab.label}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-disabled={isDisabled}
                    data-active={isActive}
                    disabled={isDisabled}
                    onClick={tab.onClick}
                    className={tabClassName}
                  >
                    {tab.label}
                  </button>
                );
              }

              if (tab.href && !isDisabled) {
                return (
                  <Link
                    key={tab.label}
                    href={tab.href}
                    role="tab"
                    aria-selected={isActive}
                    data-active={isActive}
                    className={tabClassName}
                  >
                    {tab.label}
                  </Link>
                );
              }

              return (
                <span
                  key={tab.label}
                  role="tab"
                  aria-selected={isActive}
                  aria-disabled={isDisabled}
                  data-active={isActive}
                  className={`${tabClassName} cursor-not-allowed opacity-50`}
                >
                  {tab.label}
                </span>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
