# AGENTS.md - KIPSMTHN Creative Platform

This file contains instructions and tips for working with the Creative Platform codebase.

## Design System

All UI components should use the centralized design system defined in `src/app/globals.css`. See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for complete documentation.

### Key Principles

1. **Use semantic classes** - Prefer `.ui-*` classes over hardcoded Tailwind utilities
2. **Dark mode first** - All components must work in both light and dark modes
3. **Consistent spacing** - Use the design token scale (see DESIGN_SYSTEM.md)
4. **No inline styles** - Use CSS classes for all styling

### When Adding New Components

1. Check if a semantic class already exists in `globals.css`
2. If not, add it to the appropriate section in `globals.css`
3. Update DESIGN_SYSTEM.md to document the new class
4. Use the class consistently across the platform

### Card Patterns

**Standard Card:**
```tsx
<div className="ui-card">
  <div className="ui-card-header">...</div>
  <div className="ui-card-content">...</div>
  <div className="ui-card-footer">...</div>
</div>
```

**Stat/Metric Card:**
```tsx
<div className="ui-stat-card">
  <p className="ui-stat-label">Label</p>
  <p className="ui-stat-value">Value</p>
  <p className="ui-stat-detail">Detail</p>
</div>
```

**Interactive Card:**
```tsx
<Link href="/..." className="ui-card ui-card-interactive">
  ...
</Link>
```

### Form Elements

Always use the semantic classes:
- Labels: `.ui-label`
- Inputs: `.ui-input`
- Selects: `.ui-select`
- Textareas: `.ui-textarea`

### Buttons

Use the Button component from `src/components/ui/Button.tsx` with semantic classes:
- Primary: `.ui-button-primary`
- Secondary: `.ui-button-secondary`
- Ghost: `.ui-button-ghost`
- Destructive: `.ui-button-destructive`

## Dark Mode

The platform uses a `dark` class on the `<html>` element. Test all changes in both modes.

Toggle dark mode using the ThemeToggle component.

## Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Test at all breakpoints

## Building

```bash
npm run build
```

Note: If Turbopack fails, try:
```bash
NEXT_DISABLE_TURBOPACK=1 npm run build
```

## Testing

Run tests with:
```bash
npm test
```

Lint with:
```bash
npm run lint
```

## Database

Use Drizzle ORM for all database operations. See `src/db/` for schema definitions.

## Authentication

Clerk is used for authentication. Protected routes should use:
```tsx
import { useUser } from '@clerk/nextjs';
```

## Future Work

- [ ] Convert remaining hardcoded styles to semantic classes
- [ ] Add more component variants (with images, multi-step)
- [ ] Implement animation tokens
- [ ] Add component library (Button, Input, Card components)
