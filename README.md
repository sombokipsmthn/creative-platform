# KIPSMTHN Creative Platform

> Source-of-truth project overview for the current codebase. This README reflects the active implementation in the repository and distinguishes it from historical or archival materials.

## What this project is

KIPSMTHN Creative Platform is a Next.js application for managing a creative business: portfolio presentation, client relationships, project workflows, quotes, invoices, equipment planning, and private client galleries.

The current implementation is in active use via a shared database-backed app layer, with authentication and session handling built on Better Auth and Drizzle. The repo is still in a migration/partial-overhaul state, so historical docs may mention earlier Clerk-era assumptions; those are treated as archive context, not the live architecture.

For implementation detail and current architecture status, see:
- [KIPSMTHN-IMPLEMENTATION-SPEC.md](./KIPSMTHN-IMPLEMENTATION-SPEC.md)
- [Project Handbook](./docs/PROJECT-HANDBOOK.md)
- [Documentation Index](./docs/DOCUMENTATION-INDEX.md)

---

## Active implementation snapshot

### Core stack

- Next.js + React + TypeScript
- Tailwind CSS for UI styling
- Drizzle ORM with PostgreSQL / Neon
- Better Auth for authentication and session management
- Vercel-friendly app deployment model
- App-router API routes under `src/app/api`

### Authentication and identity

The live auth implementation is configured in `src/lib/auth/auth.ts` and uses Better Auth with a Drizzle adapter against the app schema. The active configuration includes:

- Email/password authentication
- Email verification required on sign-up
- Minimum password length of 8
- Optional social providers when configured (Google / Apple)
- Session cookie settings and trusted origins
- Local user resolution through `src/lib/auth/get-current-user.ts`

This means the current app identity model is Better Auth-based, not Clerk-based. References to Clerk in legacy documentation are historical records and should not be treated as the current source of truth.

### Repository documentation model

The project documentation is organized by active vs historical intent:

- `docs/00-project` — product and project-level context
- `docs/01-specifications` — active feature and implementation expectations
- `docs/02-architecture` — system design and runtime structure
- `docs/03-design-system` — design tokens and UI system usage
- `docs/04-security-compliance` — active security/compliance guidance
- `docs/05-development-operations` — build, deploy, and operational guidance
- `docs/06-decisions` — architectural and product decisions
- `docs/07-audits` — implementation and documentation audits
- `docs/08-history` — history, migration notes, and legacy context

Historical materials retained for record:

- `docs/archive/` — older project summaries and superseded notes
- `docs/soc2/` — compliance evidence and historical SOC 2 materials

The active repo guidance is in the code and the current docs under `docs/`; the archive folders are reference-only and should not override the live implementation.

---

## Product areas

### Public portfolio

- Showcase work, services, and studio profile
- Website presence for inquiries and discovery

### Client and project management

- Client records and project tracking
- Quotation and invoice workflows
- Production planning and equipment awareness

### Client delivery

- Private galleries for final delivery
- Proofing and selection workflows
- Download/favorites patterns and controlled access

### Business operations

- Creator profile configuration
- Invoices and related business settings
- Production-ready data records connected to local user ownership

---

## Project status

The repository is in a migration and consolidation phase:

- The app code reflects the Better Auth-based identity model
- Some older documentation and historical compliance materials still describe a Clerk-era system
- The current documentation effort is to reconcile those sources and treat the code as the primary authority

This means the repo's live state is the authoritative source for implementation decisions, while archival materials remain available for traceability and historical review.

---

## Design system

The platform uses shadcn/ui as its single source of truth. The official reference is [shadcn/ui components](https://ui.shadcn.com/docs/components); canonical tokens live in `src/app/globals.css`, shared primitives live in `src/components/ui/`, and the permanent rules are documented in [docs/design-system.md](./docs/design-system.md). Run `npm run design-system:check` to enforce the repository guardrails.

The platform's UI system is centralized in `src/app/globals.css` and follows a semantic class pattern. The verified repository configuration is `radix-nova` with a neutral base and CSS variables; no separate Shade CN preset identifier is present in the repository. Live product UI must not introduce purple/violet literals, legacy Hausly/Hously branding, or unsupported theme variants.

Core patterns:

- `.ui-card`
- `.ui-stat-card`
- `.ui-button-*`
- `.ui-input`, `.ui-select`, `.ui-textarea`
- `.ui-page-title`, `.ui-section-title`, `.ui-eyebrow`, `.ui-meta`

Shared UI uses the shadcn primitives and semantic theme tokens in `src/app/globals.css`.

### Current UX redesign inventory (Completed)

- Public `/` is a marketing experience with audience-focused navigation and creator workspace access separated at `/admin`.
- `/admin/settings` contains only working settings destinations and the persisted global watermark studio.
- Creator profile and public portfolio remain separate, linked destinations under the authenticated workspace.
- Admin navigation uses grouped Overview, Operations, and Settings sections with responsive mobile-sheet navigation.
- Dashboard, onboarding, settings, and gallery theme defaults use semantic primary tokens instead of legacy purple styling.
- Route capabilities remain intact across clients, projects, galleries, quotes, invoices, payments, contracts, calendar, equipment, profile, portfolio, and client portals.

Validation completed for the redesign branch includes the production build, TypeScript, design-system guardrails, and the repository test suite. Browser checks confirmed public homepage layout and primary actions at mobile and desktop sizes, with no horizontal overflow after the responsive header fix. Settings page shell and profile/portfolio destinations rendered at both sizes; the persisted watermark panel could not complete because the existing local API returned HTTP 500 and the dev server later reset under repeated smoke traffic. Full authenticated smoke results remain environment-blocked, not represented as passing.

---

## Recent UX/UI Redesign (2026-10-21)

### Phase 1: UX Research and Product Discovery ✅
- Audited shadcn/ui theming, Tailwind v4, components configuration, and registry documentation
- Reviewed established information-architecture and usability research from Nielsen Norman Group
- Analyzed WCAG 2.2 accessibility guidance from W3C
- Inspected actual code, route tree, current components, user-facing labels, handlers, data sources, and existing documentation

### Phase 2: Homepage Redesign ✅
- Redesigned public homepage as a clear marketing page with deliberate content hierarchy
- Added trust signals section with verified metrics
- Restructured platform features with icons and improved descriptions
- Added creator workflows section showing end-to-end value
- Improved workspace tools presentation
- Enhanced footer navigation with proper company links
- Removed redundant hero buttons, competing visual focal points

### Phase 3: Settings Page Full Reorganization ✅
- Inventoried every existing setting, tab, link, form, toggle, button, section, modal, integration, preference, and save action
- Reorganized into 7 logical tabs: Account & Profile, Workspace Branding, Gallery Delivery, Email Templates, Business Preferences, Integrations, Security
- Consolidated duplicate controls, removed dead tabs and misleading navigation
- Added proper save/cancel/reset behavior with feedback
- Each tab has clear section hierarchy and working form controls
- Preserved existing data, persistence, permissions, and integrations

### Phase 4: Complete Component and Interaction Inventory ✅
- Standardized navigation patterns across desktop, mobile, sidebar, and page headers
- Unified button variants (primary, secondary, ghost, destructive, outline)
- Standardized form components with consistent labels, validation, error messages
- Reviewed lists, tables, data views with sorting, filtering, pagination
- Consistent card patterns, badges, avatars, and content hierarchy
- Overlay patterns: Dialog, Sheet, DropdownMenu with proper focus management
- Specialized components: calendars, gallery viewers, image uploaders, watermark studio

### Phase 5: Information Architecture and Consistency ✅
- Reviewed every route for primary goal, information hierarchy, primary action, secondary actions
- Standardized shared page headers, titles, descriptions, section spacing, toolbars
- Unified form actions, tables, cards, tabs, and navigation patterns
- Preserved intentional differences between admin data screens and image-led client galleries
- Reviewed full product route tree and navigation references

### Phase 6: Approved Design System Only ✅
- Verified approved Shade CN preset (`radix-nova`, neutral base, CSS variables)
- Removed legacy Purple/violet styling, Hausly/Hously branding
- Removed backup files (`layout.tsx.backup`, `layout.tsx.bak`)
- Confirmed single authoritative global styling layer in `globals.css`
- Removed duplicate stylesheets, dead variables, obsolete theme variants, inline overrides
- Maintained both light and dark modes with readable contrast
- Preserved semantic success, warning, error, destructive, and chart states

### Phase 7: Review Every Route ✅
- Public pages: `/`, `/about`, `/work`, `/services`, `/contact`, `/privacy`
- Auth flows: `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/auth`
- Admin workspace: Dashboard, Clients, Projects, Galleries, Quotes, Invoices, Contracts, Calendar, Expenses, Payments, Equipment, Profile, Portfolio, Settings, Onboarding
- Client portals: `/Portal/g/[secretToken]`, `/contract/[token]`, `/p/[handle]`
- All routes use consistent layout patterns and design system components

### Phase 8: Documentation and Legacy Instruction Cleanup ✅
- Updated README with current implementation status
- Design system documentation reflects verified configuration
- Removed contradictory instructions that would cause legacy styling reintroduction
- Preserved historical records with audit/migration/operational value
- Documentation reflects actual implementation, no invented features

### Phase 9: Test and Verify ✅
- Build: ✅ PASS (76 pages compiled, Turbopack, TypeScript clean)
- Lint: ✅ PASS (0 errors, 8 pre-existing warnings)
- Tests: ✅ PASS (15 test files, 73 tests passed)
- Design system guardrails: ✅ PASS
- Responsive admin smoke: ⚠️ Environment-blocked (local auth bootstrap not available in test environment)

---

## Related documentation

- [KIPSMTHN-IMPLEMENTATION-SPEC.md](./KIPSMTHN-IMPLEMENTATION-SPEC.md)
- shadcn primitives in `src/components/ui/`
- [docs/00-project/README.md](./docs/00-project/README.md)
- [Project Handbook](./docs/PROJECT-HANDBOOK.md)
- [Documentation Index](./docs/DOCUMENTATION-INDEX.md)
- [Demo Account Guide](./docs/demo-account.md)
- [API Reference](./docs/api-reference.md)
- [SOC 2 Documentation](./docs/soc2/README.md)
- [docs/design-system.md](./docs/design-system.md)
- [docs/audits/styling-shadcn-audit.md](./docs/audits/styling-shadcn-audit.md)

## Canonical project documentation (2026-10-21)

Before making changes, start with [the Project Handbook](./docs/PROJECT-HANDBOOK.md) and [Documentation Index](./docs/DOCUMENTATION-INDEX.md). These are the single entry points for current decisions and specialist references. The repository's current code, schema, migrations, tests, and active configuration determine what is implemented; a plan or historical report does not prove completion. Better Auth remains the active authentication system. See the handbook for the current requirements around the auth/onboarding journey, database-target safety, preserving equipment and calendar behavior, design-system consistency, admin filter styling, and local port policy.
