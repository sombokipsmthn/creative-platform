> **Historical snapshot notice (2026-10-21):** This report records a prior cleanup pass and does not establish the current state of every component. The active styling contract is [Design System](./design-system.md); current product decisions are in [Project Handbook](./PROJECT-HANDBOOK.md).

# shadcn Styling Cleanup Report

## Branch and safety

- Branch: `chore/shadcn-styling-cleanup`
- Base: latest `dev` at the time this branch was created.
- No changes were made directly to `dev`.
- The cleanup was reapplied to the current `dev` state to preserve the newer changes that landed after the initial branch was created.

## Historical source

The Hously-branded change is traceable to [PR #122 / commit 39a607544951a6008b7d41604c54ea9824a81fb3](https://github.com/sombokipsmthn/creative-platform/commit/39a607544951a6008b7d41604c54ea9824a81fb3), merged on 20 October 2026. It changed `src/app/page.tsx` and the global font import in `src/app/globals.css`. The homepage used the brand spelling **Hously** (not Housely), replaced KIPSMTHN platform sections with architecture-studio content, and added DM Mono, Manrope, and Playfair Display font imports.

## Implemented

- Preserved the latest `dev` version of `src/app/page.tsx`, which already contains KIPSMTHN platform content and no Hously copy, and converted its remaining purple utilities to shadcn semantic tokens. This avoids replacing newer homepage work with an older snapshot.
- Removed the external Hously-era Google Fonts import. The root layout now uses Outfit through `next/font`, and the shared Tailwind font tokens use that single sans-serif font for both normal and monospace utility classes.
- Replaced the original purple primary accent with a neutral shadcn semantic primary in light and dark themes. Updated accent-soft, hover, ring, and tinted shadow tokens to neutral equivalents.
- Removed the legacy `--color-purple-*` aliases and replaced old purple/violet/indigo/fuchsia utility classes found across public pages, admin pages, the client portal, contracts, gallery controls, equipment selectors, authentication screens, and shared components with shadcn semantic tokens such as `bg-primary`, `text-primary`, `border-primary`, and `ring-ring`.
- Removed invalid and hard-coded purple color values found in the shared stylesheet.
- Updated the old design-system documentation, maintenance scripts, and styling backups so they no longer reintroduce the previous purple utility classes.
- Preserved the existing shadcn/Radix components, route behavior, page structure, data handling, and gallery-theme configuration. Creator-configurable gallery accent colors remain configurable because that is a product feature, not the platform-wide theme.

## Remaining shadcn consistency gaps

These are follow-up candidates, not Hously leftovers:

1. **Theme editor and calendar forms:** some inputs, selects, range sliders, color inputs, and textareas remain native HTML controls rather than dedicated shadcn form primitives.
2. **Compatibility CSS:** the shared `ui-*` and `admin-*` classes still exist as a compatibility layer. They use semantic tokens, but are not all direct shadcn component instances.
3. **Gallery-specific theme values:** the gallery theme editor deliberately lets creators select their own colors and styles. These values should not be overwritten by the platform's neutral primary token.
4. **Component coverage:** some feature-specific surfaces have bespoke layout classes. A follow-up pass can migrate those one component at a time to the existing shadcn primitives, preserving state, accessibility, and workflows.

## Validation

- The source of the Hously import and homepage replacement was identified in PR #122.
- The branch was rebased/squashed onto the latest `dev` head before final review so newer homepage and smoke-test changes are preserved.
- The homepage now has one metadata export and no Hously or purple utility references.
- A local lint/build and browser walkthrough have not been run in this environment. Before merging, verify `npm run lint`, `npm run build`, and the homepage, light/dark theme, calendar, gallery, quote, invoice, and contract workflows. Vercel checks can also be rate-limited independently of code correctness.
