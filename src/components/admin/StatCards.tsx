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
        <Card key={stat.label} className="">
          <CardHeader className="">
            <CardTitle className="">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="">
            <div className="tabular-nums">
              {stat.value}
            </div>
            {stat.detail && (
              <p className="">{stat.detail}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
