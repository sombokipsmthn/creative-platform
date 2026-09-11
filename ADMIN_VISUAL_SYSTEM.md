# Admin Visual System Implementation Guide

## System Overview

This guide documents the unified visual system for all authenticated `/admin` pages. All admin pages now share:

1. **Centralized CSS system** (`admin-unified.css`) providing consistent styles
2. **Shared React components** for headers, stat cards, pagination, empty states, status badges
3. **Admin utilities** (`admin-utils.ts`) for common formatting and operations
4. **Design tokens** from globals.css used throughout

## Shared Components

### PageHeader
Path: `src/components/admin/PageHeader.tsx`

Usage:
```tsx
<PageHeader
  backLink="/admin"
  title="Client CRM"
  description="Database-backed client records and workflow status."
  primaryAction={<Button onClick={...}>+ New Client</Button>}
/>
```

### StatCards
Path: `src/components/admin/StatCards.tsx`

Usage:
```tsx
<StatCards 
  stats={[
    { label: 'Total Clients', value: 42, detail: '+3 this month' },
    { label: 'Active', value: 38, color: 'success' },
  ]}
  columns={4}
/>
```

### StatusBadge
Path: `src/components/admin/StatusBadge.tsx`

Usage:
```tsx
<StatusBadge status="active" />          {/* auto-mapped to success */}
<StatusBadge status="draft" variant="default" />
```

### AdminPagination
Path: `src/components/admin/AdminPagination.tsx`

Usage:
```tsx
<AdminPagination
  currentPage={page}
  totalPages={Math.ceil(items.length / pageSize)}
  totalItems={items.length}
  itemsPerPage={pageSize}
  onPageChange={setPage}
/>
```

### EmptyState
Path: `src/components/admin/EmptyState.tsx`

Usage:
```tsx
<EmptyState
  icon={<Icon className="h-6 w-6" />}
  title="No items"
  description="Get started by creating your first item."
  action={<Button>Create Item</Button>}
/>
```

## CSS Classes Reference

### Page Structure
- `.admin-page` - Main page wrapper
- `.admin-page-container` - Content container (max-width, auto margins)
- `.admin-page-header` - Page title section
- `.admin-page-back` - Back link
- `.admin-page-title` - Large page title (1.875rem, light weight)
- `.admin-page-subtitle` - Description text
- `.admin-page-actions` - Primary actions container

### Sections
- `.admin-section` - Grouped content section
- `.admin-section-title` - Section heading

### Stat Cards
- `.admin-stat-cards` - Grid container (2 cols mobile, 4 cols desktop)
- `.admin-stat-card` - Individual stat card
- `.admin-stat-label` - Stat label (uppercase, small)
- `.admin-stat-value` - Large stat number
- `.admin-stat-detail` - Additional info (smaller, muted)

### Filter Bar
- `.admin-filter-bar` - Filter panel
- `.admin-filter-search` - Search input wrapper
- `.admin-filter-controls` - Filter controls area

### Tables
- `.admin-table` - Table element
- `.admin-table-header` - Table header row
- `.admin-table-row` - Table row (hover effect)
- `.admin-table-cell` - Table cell

### Status Badges
- `.admin-status-badge` - Badge element
- `.admin-status-badge-dot` - Color indicator dot
- `.admin-status-badge.success` - Green variant
- `.admin-status-badge.warning` - Yellow variant
- `.admin-status-badge.danger` - Red variant
- `.admin-status-badge.info` - Blue variant
- `.admin-status-badge.accent` - Purple variant

### Buttons
- `.admin-button` - Base button
- `.admin-button-primary` - Purple, main action
- `.admin-button-secondary` - Soft surface, secondary
- `.admin-button-ghost` - Transparent, minimal
- `.admin-button-danger` - Red, destructive

### Tabs
- `.admin-tabs` - Tabs container
- `.admin-tab` - Individual tab
- `.admin-tab[data-active="true"]` - Active tab

### Pagination
- `.admin-pagination` - Pagination wrapper
- `.admin-pagination-pages` - Page numbers area
- `.admin-pagination-current` - Current page indicator

### Empty States
- `.admin-empty-state` - Empty state container
- `.admin-empty-icon` - Icon wrapper
- `.admin-empty-title` - Empty title
- `.admin-empty-description` - Empty description

### Forms
- `.admin-form-group` - Form field wrapper
- `.admin-form-label` - Field label
- `.admin-form-hint` - Helper text
- `.admin-form-error` - Error message

### Panels & Cards
- `.admin-panel` - Content panel
- `.admin-card` - Card element
- `.admin-card-interactive` - Clickable card with hover

## Admin Utilities (admin-utils.ts)

### Formatting Functions

```ts
formatDate(value?: string | null): string
  // "2025-01-09" → "09 Jan 2025"

formatDateTime(value?: string | null): string
  // Includes time

formatCurrency(amount: number, currency = 'KES'): string
  // 1000 → "KES 1,000"

statusLabel(status: string): string
  // "active_client" → "Active Client"

getInitials(name: string, company?: string | null): string
  // "John Smith", "ACME Co" → "JA"

getStatusColorClass(status: string): string
  // Legacy function returning Tailwind classes
```

### Status & Filtering

```ts
statusVariantMap: Record<string, BadgeVariant>
  // Maps status strings to badge variants

filterAndSearch<T>(options): T[]
  // Generic search/filter helper

getPaginationInfo(currentPage, itemsPerPage, totalItems)
  // { startItem: X, endItem: Y }

generatePageNumbers(currentPage, totalPages)
  // [1, 2, 3, 4, 5] for pagination UI
```

## Implementation Checklist for Page Updates

When updating an admin page to use the new system:

### 1. Page Structure
- [ ] Use `.admin-page` wrapper
- [ ] Use `.admin-page-container` for content max-width
- [ ] Import `PageHeader` component
- [ ] Remove inline header styling

### 2. Page Title Area
- [ ] Replace custom header with `<PageHeader />`
- [ ] Provide `backLink`, `title`, `description`
- [ ] Move primary action to `primaryAction` prop

### 3. Stat Cards
- [ ] Replace custom stat card markup with `<StatCards />`
- [ ] Use `admin-utils.ts` for formatting values
- [ ] Map statuses to correct color variants

### 4. Filter Bar
- [ ] Keep existing `<TableFilterBar />` component
- [ ] Ensure search placeholder is consistent
- [ ] Review filter options and pills

### 5. Tables
- [ ] Use `.admin-table`, `.admin-table-header`, `.admin-table-row`, `.admin-table-cell` classes
- [ ] Replace status badges with `<StatusBadge />`
- [ ] Use utility functions for formatting

### 6. Pagination
- [ ] Replace custom pagination with `<AdminPagination />`
- [ ] Use `getPaginationInfo()` and `generatePageNumbers()`

### 7. Empty States
- [ ] Replace custom empty state with `<EmptyState />`
- [ ] Provide icon, title, description, action

### 8. Buttons
- [ ] Use `.admin-button` with variant classes
- [ ] Or use existing `<Button />` component with `variant` prop

### 9. Forms
- [ ] Use `.admin-form-group` for field wrappers
- [ ] Use `.admin-form-label`, `.admin-form-hint`, `.admin-form-error` classes
- [ ] Keep existing `.ui-input`, `.ui-select`, `.ui-textarea` inputs

### 10. Status Badges
- [ ] Replace inline status styles with `<StatusBadge />`
- [ ] Use `.admin-status-badge*` classes if needed

## Key Design Principles

1. **Clean Hierarchy** - Page context → primary action → summary → filters → content
2. **Consistent Spacing** - Use CSS variables for gaps and padding
3. **Minimal Button Styles** - Primary (purple) for main action, secondary for alternatives
4. **Restrained Rounded** - Moderate radius (0.75rem-1rem), no excessive pills
5. **Purple Accent** - Primary actions and active states use purple
6. **Soft Shadows** - Subtle elevation, not dramatic
7. **Dark Mode Ready** - All classes respect dark color scheme
8. **Responsive** - Mobile-first, adapts to tablet/desktop

## Color System

Via CSS variables in `globals.css`:

- `--color-text-primary` - Main text (light/dark aware)
- `--color-text-secondary` - Secondary text
- `--color-text-muted` - Muted labels
- `--color-text-faint` - Very muted text
- `--color-bg-page` - Page background
- `--color-bg-card` - Card/panel background
- `--color-bg-soft` - Subtle background
- `--color-bg-input` - Form input background
- `--color-border-subtle` - Light borders
- `--color-border-strong` - Stronger borders
- `--color-accent` - Purple primary
- `--color-accent-soft` - Light purple background
- `--color-success` - Green (#10b981)
- `--color-warning` - Yellow (#f59e0b)
- `--color-danger` - Red (#ef4444)
- `--color-info` - Blue (#3b82f6)

## Migration Progress

Pages updated to use new system:
- [ ] Dashboard (`/admin`)
- [ ] Clients (`/admin/clients`) - reference page
- [ ] Projects (`/admin/projects` → redirects to `/admin/galleries`)
- [ ] Galleries (`/admin/galleries`)
- [ ] Quotes (`/admin/quotes`, `/admin/quotes/[id]`, `/admin/quotes/new`)
- [ ] Contracts (`/admin/contracts`, `/admin/contracts/[id]`, `/admin/contracts/new`)
- [ ] Invoices (`/admin/invoices`, `/admin/invoices/[id]`)
- [ ] Settings (`/admin/settings`, `/admin/profile`)
- [ ] Other pages (`/admin/expenses`, `/admin/payments`, etc.)

## Resources

- **Globals CSS** - `src/app/globals.css` (design tokens, base classes)
- **Admin Unified CSS** - `src/app/admin/admin-unified.css` (admin-specific styles)
- **Admin CSS** - `src/app/admin/admin.css` (legacy, being deprecated)
- **Button Component** - `src/components/ui/Button.tsx`
- **Admin Utilities** - `src/lib/admin-utils.ts` (formatting, helpers)
- **Admin Components** - `src/components/admin/` (shared components)

## Notes

- All times displayed in `en-KE` locale (Kenya timezone)
- Currency defaults to KES (Kenyan Shilling)
- Status badges auto-map to colors (e.g., "active" → green, "pending" → yellow)
- Dark mode fully supported via CSS variables
- All animations are subtle (150ms transitions, no bounces)
- Mobile-first responsive design with breakpoints at 640px, 768px, 1024px
