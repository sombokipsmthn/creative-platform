> **Canonical documentation entry point:** Read [docs/PROJECT-HANDBOOK.md](./docs/PROJECT-HANDBOOK.md) and [docs/DOCUMENTATION-INDEX.md](./docs/DOCUMENTATION-INDEX.md) before non-trivial changes. Better Auth remains the active auth system. Preserve existing calendar/business workflows, use the existing shadcn/global-token system, keep the public site separate from the creator workspace, and verify the current `dev` branch rather than trusting stale docs. Do not claim requested features are implemented without code/runtime evidence. The handbook documents database-target safety, equipment preservation, styling-only admin filter tasks, and the requested local port convention.

# KIPSMTHN Creative Platform Agent Rules

## Canonical UI system

- Official visual reference: https://ui.shadcn.com/docs/components.
- `src/components/ui/` is the only canonical shared UI component directory.
- Lowercase shadcn files such as `button.tsx`, `card.tsx`, and `dialog.tsx` are authoritative. Do not create case-only duplicate primitive files; domain-specific uppercase components are allowed only when they are not shared primitives.
- `src/app/globals.css` is the only global token stylesheet. Its shadcn semantic variables (`--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, and `--ring`) define light and dark themes.
- Use `cn` from `@/lib/utils`, `class-variance-authority` for variants, Radix primitives already installed in the repository, and Lucide icons.
- Reuse a canonical component before creating a primitive. Add a missing component using the official shadcn conventions and update `docs/design-system.md`.
- Do not introduce another component library or visual token system.
- Do not copy styling from obsolete branches, commits, worktrees, backups, generated files, or historical documentation.
- Preserve existing component APIs, Better Auth, Drizzle, routes, forms, accessibility behavior, and business workflows while restyling.
- Agents may not independently redefine global typography, color tokens, radii, or global styling conventions.

## Styling review and validation

All UI components should use the shadcn primitives and semantic tokens defined in `src/app/globals.css`.

Run `npm run design-system:check`, `npm run lint`, `npx tsc --noEmit`, `npm test`, and `npm run build` before committing when the relevant environment is available. Update `docs/design-system.md` whenever the canonical system changes. The automated check catches duplicate canonical files, competing UI imports, legacy global stylesheet patterns, and missing shadcn token declarations; visual review and accessibility review remain required.

## Repository safety

1. **Use semantic classes** - Prefer semantic shadcn tokens and shared primitives over hardcoded colors.
2. **Dark mode first** - All components must work in both light and dark modes.
3. **Consistent spacing** - Use the spacing tokens exposed by the shadcn theme.
4. **No inline styles** - Use CSS classes for all styling.

Inspect `git status`, `git worktree list`, and relevant diffs before editing. Never reset, stash, delete, or overwrite unrelated uncommitted work or another active worktree. Backup files are evidence during audits and must not be treated as canonical source.

1. Check if a semantic token or shared primitive already exists.
2. If not, add it to the appropriate canonical primitive or token section.
3. Keep shared styling in the existing shadcn primitives and theme tokens.
4. Use the class consistently across the platform.

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

Use the Button component from `src/components/ui/button.tsx` with shadcn variants:

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

Better auth is used for authentication. Protected routes should use:
## Future Work

- [ ] Add animation tokens for transitions
- [ ] Add more advanced component variants (forms with validation, data tables)
- [ ] Create comprehensive component library documentation
- [ ] Implement theme customization capabilities
- [ ] Add accessibility auditing and fixes

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Architecture

Preserve Next.js App Router, React, TypeScript, Tailwind CSS v4, Drizzle ORM, and Better Auth. Do not migrate authentication providers or change database schemas for styling work.
