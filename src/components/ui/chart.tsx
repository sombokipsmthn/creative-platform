'use client';

import * as React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface TrendDataPoint {
  month: string;
  value: number;
}

interface RevenueTrendChartProps {
  data: TrendDataPoint[];
  className?: string;
}

function formatMonthLabel(month: string) {
  const [year, monthNum] = month.split('-').map(Number);
  return new Date(year, monthNum - 1).toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  });
}

export function RevenueTrendChart({ data, className }: RevenueTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`h-48 flex items-center justify-center ${className ?? ''}`}>
        <p className="text-sm text-muted-foreground">No revenue data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const yAxisTickCount = maxValue > 10000 ? 4 : 3;

  return (
    <div className={`w-full h-48 ${className ?? ''}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
            horizontal={true}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 500 }}
            tickFormatter={formatMonthLabel}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 500 }}
            tickFormatter={(value) =>
              value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()
            }
            axisLine={false}
            tickLine={false}
            tickCount={yAxisTickCount}
            dx={-8}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
            labelStyle={{ color: 'var(--foreground)', fontWeight: 500 }}
            labelFormatter={(label) => typeof label === 'string' ? formatMonthLabel(label) : label}
            formatter={(value) => [
              new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(Number(value ?? 0)),
              'Collected',
            ]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={2}
            fillOpacity={0.18}
            fill="var(--primary)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}