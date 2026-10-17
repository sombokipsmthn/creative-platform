'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface StatCardsProps {
  stats: Array<{
    label: string;
    value: string | number;
    detail?: string;
    color?: 'default' | 'success' | 'warning' | 'danger';
  }>;
  columns?: 2 | 3 | 4;
}

export default function StatCards({ stats, columns = 4 }: StatCardsProps) {
  const colsClass = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
  }[columns];

  return (
    <div className={`grid grid-cols-2 gap-4 ${colsClass}`}>
      {stats.map((stat) => (
        <Card key={stat.label} className="transition-all hover:shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {stat.value}
            </div>
            {stat.detail && (
              <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
