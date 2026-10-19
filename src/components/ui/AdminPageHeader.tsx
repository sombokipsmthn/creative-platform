"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderTab { label: string; href?: string; onClick?: () => void; active: boolean; disabled?: boolean }
interface AdminPageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href: string };
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode[];
  tabs?: AdminPageHeaderTab[];
  className?: string;
}

export function AdminPageHeader({ title, description, breadcrumb, primaryAction, secondaryActions, tabs, className }: AdminPageHeaderProps) {
  return (
    <header className={cn("admin-page-header", className)}>
      {breadcrumb && <Link href={breadcrumb.href} className="admin-breadcrumb"><ChevronLeft aria-hidden="true" />{breadcrumb.label}</Link>}
      <div className="admin-page-header__row">
        <div className="min-w-0">
          <h1 className="admin-page-title">{title}</h1>
          {description && <p className="admin-page-description">{description}</p>}
        </div>
        {(primaryAction || secondaryActions?.length) && <div className="admin-page-actions">{secondaryActions?.map((action, index) => <span key={index}>{action}</span>)}{primaryAction}</div>}
      </div>
      {tabs?.length ? <nav className="admin-tabs" aria-label={`${title} sections`}>{tabs.map(tab => tab.href && tab.href !== '#' ? <Link key={tab.label} href={tab.href} aria-current={tab.active ? 'page' : undefined} className={cn('admin-tab', tab.active && 'is-active', tab.disabled && 'is-disabled')}>{tab.label}</Link> : <button key={tab.label} type="button" onClick={tab.onClick} disabled={tab.disabled} aria-current={tab.active ? 'page' : undefined} className={cn('admin-tab', tab.active && 'is-active')}>{tab.label}</button>)}</nav> : null}
    </header>
  );
}

export default AdminPageHeader;
