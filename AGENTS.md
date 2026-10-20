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

Run `npm run design-system:check`, `npm run lint`, `npx tsc --noEmit`, `npm test`, and `npm run build` before committing when the relevant environment is available. Update `docs/design-system.md` whenever the canonical system changes. The automated check catches duplicate canonical files, competing UI imports, legacy global stylesheet patterns, and missing shadcn token declarations; visual review and accessibility review remain required.

## Repository safety

Inspect `git status`, `git worktree list`, and relevant diffs before editing. Never reset, stash, delete, or overwrite unrelated uncommitted work or another active worktree. Backup files are evidence during audits and must not be treated as canonical source.

## Architecture

Preserve Next.js App Router, React, TypeScript, Tailwind CSS v4, Drizzle ORM, and Better Auth. Do not migrate authentication providers or change database schemas for styling work.
