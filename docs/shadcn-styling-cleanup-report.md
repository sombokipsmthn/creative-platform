# Styling Cleanup Report — Hously and Legacy Purple Removal

## Scope

This cleanup is isolated to `chore/remove-housely-shadcn-cleanup`, based on `dev`. It does not merge into or modify `dev`.

The design foundation remains the existing shadcn/ui setup: Tailwind CSS v4, CSS variables, Radix/shadcn primitives, and the current `src/components/ui` components.

## Historical source identified

The likely source was merged in [PR #122](https://github.com/sombokipsmthn/creative-platform/commit/39a607544951a6008b7d41604c54ea9824a81fb3), titled “feat: update font imports and theme variables to new set”, on 20 October 2026.

That change modified `src/app/page.tsx` and `src/app/globals.css`. The homepage was partially replaced with unrelated Hously-branded architecture-studio content, and the global stylesheet imported DM Mono, Manrope, and Playfair Display.

## Changes made

- Restored `src/app/page.tsx` from the pre-PR #122 version, recovering the KIPSMTHN creative-platform homepage sections and copy.
- Removed the external Google Fonts import from `src/app/globals.css`; the app's existing `next/font` Outfit setup remains the source for the global sans-serif font.
- Removed the global CSS selector hack that force-overrode elements whose class names contained purple, violet, indigo, or fuchsia. Styling is now corrected at the class/token level instead of hidden with `!important` rules.
- Replaced legacy purple utility classes in the affected application pages and components with shadcn semantic tokens such as `bg-primary`, `text-primary`, `border-primary`, and `ring-ring`.
- Replaced remaining violet/indigo accent utilities found in the calendar/gallery-related UI with shadcn semantic tokens.
- Aligned the dark sidebar primary token with `--primary`, rather than a hard-coded purple-hued OKLCH value.
- Aligned typeset body, heading, and code font variables with the existing `--font-sans` token and removed unused Geist font imports from the root layout.
- Updated design-system documentation and archived styling notes to describe semantic shadcn tokens rather than the old purple palette.
- Updated legacy calendar styling scripts and backup files so they no longer reintroduce the old purple utility classes.

## Files touched

The changes cover the following groups:

- Global styling and layout: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`.
- Public pages: `src/app/services/page.tsx`, `src/app/work/page.tsx`, `src/app/work/page-client.tsx`.
- Admin pages: clients, settings, invoices, expenses, onboarding, projects, project detail, contracts, contract templates, quote creation, quote detail, and calendar backups.
- Shared components: gallery manager, download modal, client lightbox, watermark preview, equipment catalogue/services selector, theme editor, production calendar, contract builder/editors, contract detail content, and landing-page interactive components.
- Documentation and maintenance files: `.interface-design/system.md`, `DESIGN_SYSTEM_IMPLEMENTATION_SUMMARY.md`, `ADMIN_VISUAL_SYSTEM.md`, `docs/archive/IMPLEMENTATION_COMPLETE.md`, and the legacy styling scripts.

## Gaps to review separately

This pass removes the old styling references without rewriting functional pages. Some areas still use native form controls or bespoke layout classes instead of dedicated shadcn primitives. The most visible candidates for a follow-up, component-by-component pass are:

1. `src/components/ThemeEditor.tsx` — native select, range, color, checkbox, and text inputs.
2. Calendar event forms — native inputs, selects, and textareas alongside existing shadcn cards and buttons.
3. Legacy `ui-*` and `admin-*` global classes — they now rely on shared shadcn tokens, but are still a compatibility layer rather than direct shadcn component usage.
4. Gallery themes — creator-configurable accent/background/text colors are product functionality; they should remain configurable and should not be globally forced to the platform's primary color.

These are not Hously imports. Replacing them safely requires preserving the controls' current state, validation, accessibility, and workflows.

## Validation status

- Repository search identified PR #122 as the source of the Hously-branded homepage and font-import change.
- The homepage and global stylesheet were restored/cleaned on the isolated branch.
- Purple/violet/indigo utility classes found during the repository search were converted to semantic tokens, including occurrences in legacy backups and scripts.
- A local production build, lint, and browser walkthrough have **not** been run in this environment. Run them before merging; pay particular attention to the homepage, dark/light theme, calendar selection states, gallery controls, contracts, and quotes.
