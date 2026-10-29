'use client';

interface StatCardsProps {
  stats: Array<{
    label: string;
    value: string | number;
    detail?: string;
    color?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  }>;
  columns?: 2 | 3 | 4 | 8;
}

export default function StatCards({ stats, columns = 4 }: StatCardsProps) {
  const colsClass = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    8: 'lg:grid-cols-8',
  }[columns ?? 4];

  const colorClasses = {
    default: 'text-[var(--color-text-muted)]',
    success: 'text-[var(--color-success)] dark:text-[var(--color-success)]',
    warning: 'text-[var(--color-warning)] dark:text-[var(--color-warning)]',
    danger: 'text-[var(--color-danger)] dark:text-[var(--color-danger)]',
    info: 'text-[var(--color-info)] dark:text-[var(--color-info)]',
    accent: 'text-[var(--color-accent)] dark:text-[var(--color-accent)]',
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
