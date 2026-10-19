'use client';

import * as React from 'react';
import Link from 'next/link';
import { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

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
  backLabel = 'Back',
  title,
  description,
  primaryAction,
  secondaryActions,
}: PageHeaderProps) {
  return (
    <div className="">
      {backLink && (
        <div>
          <Link
            href={backLink}
            className=""
          >
            <ChevronLeft className="" />
            {backLabel}
          </Link>
        </div>
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
          {secondaryActions && <>{secondaryActions}</>}
          {primaryAction}
        </div>
      </div>
    </div>
  );
}
