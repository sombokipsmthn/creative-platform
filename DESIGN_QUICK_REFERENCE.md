# Design System Quick Reference

## Colors

### Using CSS Variables
```css
background: var(--color-bg-card);
color: var(--color-text-primary);
border: 1px solid var(--color-border-subtle);
```

### Tailwind Equivalents
| Token | Tailwind |
|-------|----------|
| `--color-bg-page` | `bg-slate-50 dark:bg-[#09090b]` |
| `--color-bg-card` | `bg-white dark:bg-zinc-950` |
| `--color-border-subtle` | `border-slate-200 dark:border-zinc-800` |
| `--color-text-primary` | `text-slate-900 dark:text-white` |
| `--color-accent` | `text-purple-600 dark:text-purple-400` |

## Spacing

### Using CSS Variables
```css
padding: var(--spacing-lg);
margin: var(--spacing-xl);
gap: var(--spacing-md);
```

### Tailwind Equivalents
| Token | Tailwind |
|-------|----------|
| `--spacing-xs` (4px) | `p-1` |
| `--spacing-sm` (8px) | `p-2` |
| `--spacing-md` (16px) | `p-4` |
| `--spacing-lg` (24px) | `p-6` |
| `--spacing-xl` (32px) | `p-8` |
| `--spacing-2xl` (48px) | `p-12` |
| `--spacing-3xl` (64px) | `p-16` |

## Border Radius

### Using CSS Variables
```css
border-radius: var(--radius-lg);
```

### Tailwind Equivalents
| Token | Tailwind |
|-------|----------|
| `--radius-sm` (6px) | `rounded-lg` |
| `--radius-md` (8px) | `rounded-xl` |
| `--radius-lg` (12px) | `rounded-2xl` |
| `--radius-xl` (16px) | `rounded-3xl` |
| `--radius-full` | `rounded-full` |

## Common Patterns

### Card with Header
```tsx
<div className="ui-card">
  <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-900 px-5 py-4">
    <div>
      <p className="ui-eyebrow">Label</p>
      <h2 className="ui-section-title">Title</h2>
    </div>
    <Button variant="secondary">Action</Button>
  </div>
  <div className="p-5">
    <p className="ui-meta">Description</p>
  </div>
</div>
```

### Stat Card
```tsx
<div className="ui-stat-card">
  <p className="ui-stat-label">Metric Name</p>
  <p className="ui-stat-value">1,234</p>
  <p className="ui-stat-detail">+12% from last month</p>
</div>
```

### Interactive Card
```tsx
<Link href="/details" className="ui-card ui-card-interactive">
  <h3 className="ui-card-title">Card Title</h3>
  <p className="ui-meta">Description text</p>
</Link>
```

### Table
```tsx
<div className="ui-table-container">
  <table className="ui-table">
    <thead>
      <tr>
        <th className="ui-table-header">Column</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
      <tr className="ui-table-row">
        <td className="ui-table-cell">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Status Badge
```tsx
<span className="ui-badge ui-status-paid">Paid</span>
<span className="ui-badge ui-status-draft">Draft</span>
<span className="ui-badge ui-status-overdue">Overdue</span>
```

### Form Input
```tsx
<div className="space-y-1">
  <label className="ui-label">Field Label</label>
  <input type="text" className="ui-input" placeholder="Enter value" />
</div>
```

## Component Library

### Button Variants
```tsx
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="ghost">Ghost Action</Button>
<Button variant="destructive">Delete</Button>
<Button variant="primary" size="lg" className="w-full">Full Width</Button>
```

### Card Grids
```tsx
<div className="ui-card-grid ui-card-grid-3">
  {/* Cards */}
</div>
```

## Migration Checklist

When updating components:
- [ ] Replace `bg-white dark:bg-zinc-900` with `ui-card`
- [ ] Replace `border border-slate-200 dark:border-zinc-800` with `ui-card`
- [ ] Replace `rounded-xl` with appropriate `--radius` token
- [ ] Replace inline padding with `--spacing` tokens
- [ ] Replace hardcoded colors with CSS variables
- [ ] Use `.ui-*` semantic classes where applicable
