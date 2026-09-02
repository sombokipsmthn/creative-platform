# KIPSMTHN Creative Platform - Design System

## Overview

This document describes the centralized design system implemented for the KIPSMTHN Creative Platform. The system provides consistent UI components, spacing, typography, and styling across all pages while maintaining proper dark mode support.

## Design Tokens

### Colors

All colors are defined in `src/app/globals.css` using CSS custom properties:

#### Light Mode Colors
- `--color-bg-page: #f8f9fa` - Page background
- `--color-bg-card: #ffffff` - Card background
- `--color-bg-elevated: #ffffff` - Elevated surfaces
- `--color-bg-input: #f1f3f5` - Input fields
- `--color-bg-soft: #f8f9fa` - Soft backgrounds
- `--color-border-subtle: #e9ecef` - Subtle borders
- `--color-border-strong: #dee2e6` - Strong borders
- `--color-text-primary: #212529` - Primary text
- `--color-text-secondary: #495057` - Secondary text
- `--color-text-muted: #6c757d` - Muted text
- `--color-accent: #7c3aed` - Primary accent (purple)
- `--color-success: #10b981` - Success state
- `--color-warning: #f59e0b` - Warning state
- `--color-danger: #ef4444` - Error/danger state

#### Dark Mode Colors
- `--color-bg-page: #09090b` - Dark page background
- `--color-bg-card: #1e1e1e` - Dark card background
- `--color-text-primary: #f8f9fa` - Light text on dark
- `--color-accent: #8b5cf6` - Lighter purple accent

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-xs` | 0.25rem (4px) | Tight padding |
| `--spacing-sm` | 0.5rem (8px) | Small gaps |
| `--spacing-md` | 1rem (16px) | Standard padding |
| `--spacing-lg` | 1.5rem (24px) | Section padding |
| `--spacing-xl` | 2rem (32px) | Large gaps |
| `--spacing-2xl` | 3rem (48px) | Page sections |
| `--spacing-3xl` | 4rem (64px) | Hero sections |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 0.375rem (6px) | Small elements |
| `--radius-md` | 0.5rem (8px) | Inputs, badges |
| `--radius-lg` | 0.75rem (12px) | Cards, buttons |
| `--radius-xl` | 1rem (16px) | Large cards |
| `--radius-2xl` | 1.5rem (24px) | Feature cards |
| `--radius-3xl` | 1.875rem (30px) | Hero sections |
| `--radius-full` | 9999px | Round elements |

### Typography Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--font-size-xs` | 0.75rem (12px) | Eyebrow text, metadata |
| `--font-size-sm` | 0.875rem (14px) | Body text |
| `--font-size-md` | 1rem (16px) | Standard body |
| `--font-size-lg` | 1.125rem (18px) | Subtitles |
| `--font-size-xl` | 1.25rem (20px) | Card titles |
| `--font-size-2xl` | 1.5rem (24px) | Section titles |
| `--font-size-3xl` | 1.875rem (30px) | Page titles |
| `--font-size-4xl` | 2.25rem (36px) | Hero titles |
| `--font-size-5xl` | 3rem (48px) | Large headings |
| `--font-size-6xl` | 3.75rem (60px) | Display text |

## Semantic CSS Classes

### Card Components

```css
.ui-card          /* Base card with border and padding */
.ui-card-interactive  /* Hoverable card with transition */
.ui-stat-card     /* Compact card for metrics/KPIs */
```

### Section Components

```css
.page-shell       /* Full page wrapper */
.page-header      /* Page header with border */
.page-title       /* H1 styling */
.page-subtitle    /* Description text */
.section          /* Content section */
.section-header   /* Section header container */
.section-title    /* H2 styling */
.section-description  /* Supporting text */
```

### Typography

```css
.ui-eyebrow       /* Uppercase label, small text */
.ui-meta          /* Muted secondary text */
.ui-body          /* Standard body text */
```

### Form Elements

```css
.ui-input         /* Text input field */
.ui-select        /* Select dropdown */
.ui-textarea      /* Multi-line text input */
.ui-label         /* Form label */
```

### Buttons

```css
.ui-button        /* Base button */
.ui-button-primary    /* Primary action */
.ui-button-secondary  /* Secondary action */
.ui-button-ghost    /* Transparent button */
.ui-button-destructive /* Danger action */
```

### Tables

```css
.ui-table-container   /* Table wrapper */
.ui-table             /* Table element */
.ui-table-header      /* Table header cell */
.ui-table-cell        /* Table data cell */
.ui-table-row         /* Row hover state */
```

### Status Indicators

```css
.ui-badge           /* Generic badge */
.ui-status-badge    /* Status indicator */
.ui-status-active   /* Active/Online */
.ui-status-inactive  /* Inactive/Offline */
.ui-status-pending  /* Pending approval */
.ui-status-paid     /* Payment complete */
.ui-status-overdue  /* Overdue payment */
.ui-status-draft    /* Draft status */
```

### Utility Classes

```css
.ui-card-grid           /* Card grid layout */
.ui-card-grid-2         /* 2-column grid */
.ui-card-grid-3         /* 3-column grid */
.ui-card-grid-4         /* 4-column grid */
.ui-empty-state         /* Empty state container */
.ui-skeleton            /* Loading skeleton */
.ui-divider             /* Horizontal divider */
```

### Public Site Classes

```css
.public-card         /* Stylized card for public pages */
.public-feature-card /* Feature highlight card */
.public-hero         /* Hero section wrapper */
```

## Usage Guidelines

### When to Use Semantic Classes

1. **Card containers**: Use `.ui-card` for consistent padding and borders
2. **Interactive elements**: Use `.ui-card-interactive` for hoverable cards
3. **Metrics/KPIs**: Use `.ui-stat-card` for dashboard statistics
4. **Forms**: Use `.ui-input`, `.ui-select`, `.ui-label` for consistent form styling
5. **Buttons**: Use `.ui-button-*` variants for action buttons

### Typography Hierarchy

- Use `.ui-eyebrow` for section labels (uppercase, small)
- Use `.ui-page-title` for main page headings
- Use `.ui-section-title` for section headings
- Use `.ui-meta` for secondary information
- Use `.ui-body` for standard body text

### Dark Mode Support

All semantic classes automatically adapt to dark mode through CSS custom properties. No additional classes are needed.

## Migration Guide

### Converting from Hardcoded Styles

**Before:**
```html
<div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6">
```

**After:**
```html
<div className="ui-card p-6">
```

### Converting Buttons

**Before:**
```html
<button className="bg-purple-600 text-white px-4 py-2 rounded-lg">
```

**After:**
```html
<Button variant="primary">
```

## Component Examples

### Standard Card

```tsx
<div className="ui-card">
  <div className="ui-card-header">
    <h3 className="ui-card-title">Card Title</h3>
  </div>
  <div className="ui-card-content">
    <p className="ui-meta">Card description</p>
  </div>
  <div className="ui-card-footer">
    <Button variant="primary">Action</Button>
  </div>
</div>
```

### Stat Card

```tsx
<div className="ui-stat-card">
  <p className="ui-stat-label">Total Revenue</p>
  <p className="ui-stat-value">$12,345</p>
  <p className="ui-stat-detail">+12% from last month</p>
</div>
```

### Interactive Card

```tsx
<Link href="/details" className="ui-card ui-card-interactive">
  <h3 className="ui-card-title">View Details</h3>
  <p className="ui-meta">Click to learn more</p>
</Link>
```

### Status Badge

```tsx
<span className="ui-badge ui-status-paid">Paid</span>
<span className="ui-badge ui-status-draft">Draft</span>
<span className="ui-badge ui-status-overdue">Overdue</span>
```

## Best Practices

1. **Consistency**: Use semantic classes instead of inline Tailwind utilities
2. **Accessibility**: Ensure proper contrast ratios in both light and dark modes
3. **Responsiveness**: Test at all breakpoints (mobile, tablet, desktop)
4. **Performance**: Avoid excessive use of backdrop-blur and shadows
5. **Maintainability**: Update design tokens in `globals.css` for global changes

## Future Improvements

- Add more component variants (cards with images, multi-step forms)
- Create reusable component library (Button, Input, Card components)
- Add animation tokens for transitions
- Document component props and variants

## Related Files

- `src/app/globals.css` - Design token definitions and CSS classes
- `src/components/ui/Button.tsx` - Button component
- `src/app/admin/dashboard/page.tsx` - Dashboard implementation
- `src/app/admin/clients/page.tsx` - Client management

## Notes

- The design system uses Tailwind CSS v4 with PostCSS
- Dark mode is toggled via the `html.dark` selector
- All colors are defined as CSS custom properties for easy theming
- The system is backward compatible with existing `btn-*` classes
