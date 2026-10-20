# KIPSMTHN Design System

The permanent visual reference is the official [shadcn/ui component documentation](https://ui.shadcn.com/docs/components). KIPSMTHN keeps its brand content and media treatments, but shared product UI follows shadcn/ui's component language.

## Sources of truth

- **Tokens and global behavior:** `src/app/globals.css`
- **Shared components:** `src/components/ui/`, with lowercase filenames authoritative and no case-only duplicate primitive files
- **Class utility:** `src/lib/utils.ts` and its `cn` export
- **Component configuration:** `components.json`
- **Repository enforcement:** `AGENTS.md`, `scripts/check-design-system.mjs`, and CI

Semantic CSS variables define backgrounds, foregrounds, cards, popovers, primary and secondary actions, muted surfaces, accent states, destructive states, borders, inputs, focus rings, charts, sidebar surfaces, radius, and typography. The `.dark` class provides the dark theme. Components consume these tokens through shadcn-compatible Tailwind utilities such as `bg-background`, `text-foreground`, `bg-card`, `border-border`, `ring-ring`, and `text-muted-foreground`.

## Component conventions

Use the existing component before adding a primitive. Shared components use Radix primitives where interaction requires them, `class-variance-authority` for variants, `cn` for class composition, and Lucide icons. Preserve public props and behavior when replacing styling. Application-specific media, gallery, document, chart, print, and layout styles may remain outside the shared primitives when they do not redefine global tokens.

Canonical components currently include Button, Input, Textarea, Label, Select, Checkbox where present, Radio Group where present, Switch where present, Card, Badge, Separator, Skeleton, Alert, Dialog, Sheet, Dropdown Menu, Popover where present, Tooltip where present, Tabs, Table, Form-related components where present, Breadcrumb where present, Avatar, Progress, and calendar/date-picker components where existing workflows require them.

Use `@/components/ui/<lowercase-name>` in new code. Do not create case-only duplicate primitive files; domain-specific components may use descriptive uppercase filenames.

## Rules

1. Do not add a competing component library or a second token namespace.
2. Do not define global colors, typography, radii, shadows, or focus behavior in page components.
3. Do not copy old styling from branches, worktrees, backup files, generated templates, or historical docs.
4. Prefer semantic tokens and canonical primitives over raw repeated visual definitions.
5. Keep domain-specific gallery image treatments, charts, print styles, and media layout styles when they do not conflict with shared UI behavior.
6. Preserve Better Auth, Drizzle, route structure, form behavior, validation, and business workflows.
7. Run `npm run design-system:check`, lint, TypeScript, tests, and the production build before committing.
8. Update this document when the canonical tokens or shared component conventions change.

## Automated versus review checks

`npm run design-system:check` verifies the token declarations, canonical lowercase component set, uppercase compatibility exports, duplicate primitive files, competing UI package imports, and obsolete global stylesheet imports. ESLint, TypeScript, tests, and the build catch implementation regressions. Reviewers must still inspect representative marketing, dashboard, admin, and client portal screens in light and dark themes, including keyboard focus and responsive layouts; the repository does not claim automated visual protection.
