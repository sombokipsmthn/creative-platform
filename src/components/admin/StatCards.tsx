'use client';

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

  const colorClasses = {
    default: 'text-[var(--color-text-muted)]',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className={`grid grid-cols-2 gap-4 ${colsClass}`}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="ui-stat-card min-h-[6.5rem]"
        >
          <p className={`ui-stat-label ${colorClasses[stat.color ?? 'default']}`}>
            {stat.label}
          </p>
          <p className="ui-stat-value">{stat.value}</p>
          {stat.detail && <p className="ui-stat-detail">{stat.detail}</p>}
        </div>
      ))}
    </div>
  );
}
