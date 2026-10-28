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
    <div className={`mb-6 border-b border-border pb-6 sm:mb-8 ${className}`}>
      <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
        {/* Left side: Breadcrumb and Title/Description */}
        <div className="mb-1 min-w-0 flex-1 md:mb-0">
          {breadcrumb && (
            <Link
              href={breadcrumb.href}
              className="mb-1 inline-flex min-h-7 items-center rounded-sm text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              ← {breadcrumb.label}
            </Link>
          )}
          <h1 className="break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {/* Right side: Actions and Tabs */}
        <div className="flex min-w-0 flex-col md:items-end md:gap-4">
          {/* Tabs */}
          {tabs && tabs.length > 0 && (
            <div className="mb-4 flex max-w-full gap-2 overflow-x-auto pb-1 md:mb-0">
              {tabs.map((tab) => {
                const isActive = tab.active ?? false;
                const isDisabled = tab.disabled ?? false;
                const tabClassName = isActive
                  ? 'ui-tab-active'
                  : 'ui-tab';
                return (
                  <div key={tab.label} className="shrink-0">
                    {tab.onClick ? (
                      <Button
                        type="button"
                        onClick={tab.onClick}
                        disabled={isDisabled}
                        variant={isActive ? 'primary' : 'ghost'}
                        size="sm"
                        className="rounded-none border-b-2 text-xs uppercase tracking-widest"
                      >
                        {tab.label}
                      </Button>
                    ) : tab.href ? (
                      isDisabled ? (
                        <span
                          className={`px-3 py-1.5 text-xs font-sans uppercase tracking-widest text-muted-foreground/50 cursor-not-allowed whitespace-nowrap`}
                        >
                          {tab.label}
                        </span>
                      ) : (
                        <Link
                          href={tab.href}
                          className={tabClassName}
                        >
                          {tab.label}
                        </Link>
                      )
                    ) : (
                      <span
                        className={tabClassName}
                        aria-current={isActive ? 'true' : 'false'}
                      >
                        {tab.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex min-w-0 max-w-full flex-wrap gap-2">
            {primaryAction && (
              <div className="flex w-full min-w-0 max-w-full flex-wrap md:w-auto">{primaryAction}</div>
            )}
            {secondaryActions && (
              <div className="flex min-w-0 max-w-full flex-wrap gap-2">
                {secondaryActions.map((action, index) => (
                  <div key={index} className="flex-shrink-0">
                    {action}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}