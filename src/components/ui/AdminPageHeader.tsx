'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

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
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={`border-b border-slate-200 dark:border-zinc-800/80 pb-6 mb-8 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        {/* Left side: Breadcrumb and Title/Description */}
        <div className="flex-1 min-w-0 mb-4 md:mb-0">
          {breadcrumb && (
            <Link
              href={breadcrumb.href}
              className="text-xs font-sans text-purple-600 dark:text-purple-400 hover:underline mb-1"
            >
              ← {breadcrumb.label}
            </Link>
          )}
          <h1 className="text-3xl font-light text-slate-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>

        {/* Right side: Actions and Tabs */}
        <div className="flex flex-col md:flex-row md:items-center md:gap-4">
          {/* Tabs */}
          {tabs && tabs.length > 0 && (
            <div className="flex gap-2 overflow-x-auto mb-4 md:mb-0">
              {tabs.map((tab) => {
                const isActive = tab.active ?? false;
                const isDisabled = tab.disabled ?? false;
                return (
                  <div key={tab.label} className="flex-shrink-0">
                    {tab.href ? (
                      isDisabled ? (
                        <span className="px-3 py-1.5 text-xs font-sans uppercase tracking-widest border-transparent text-slate-400 dark:text-zinc-500 cursor-not-allowed">
                          {tab.label}
                        </span>
                      ) : (
                        <Link
                          href={tab.href}
                          className={`px-3 py-1.5 text-xs font-sans uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                            isActive
                              ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                              : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {tab.label}
                        </Link>
                      )
                    ) : tab.onClick ? (
                      <button
                        onClick={tab.onClick}
                        disabled={isDisabled}
                        className={`px-3 py-1.5 text-xs font-sans uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                          isActive
                            ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                            : isDisabled
                              ? 'border-transparent text-slate-400 dark:text-zinc-500 cursor-not-allowed'
                              : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ) : (
                      <span className={`px-3 py-1.5 text-xs font-sans uppercase tracking-widest ${
                        isActive
                          ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold border-b-2'
                          : isDisabled
                            ? 'text-slate-400 dark:text-zinc-500'
                            : 'text-slate-500 dark:text-zinc-400'
                      }`}
                        >
                          {tab.label}
                        </span>
                    )}
                  </div>
                )}
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {primaryAction && (
              <div className="flex-shrink-0">{primaryAction}</div>
            )}
            {secondaryActions && (
              <div className="flex flex-wrap gap-2">
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
