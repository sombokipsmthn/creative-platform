# KIPSMTHN Creative Platform

> Source-of-truth project overview for the current codebase. This README reflects the active implementation in the repository and distinguishes it from historical or archival materials.

## What this project is

KIPSMTHN Creative Platform is a Next.js application for managing a creative business: portfolio presentation, client relationships, project workflows, quotes, invoices, equipment planning, and private client galleries.

The current implementation is in active use via a shared database-backed app layer, with authentication and session handling built on Better Auth and Drizzle. The repo is still in a migration/partial-overhaul state, so historical docs may mention earlier Clerk-era assumptions; those are treated as archive context, not the live architecture.

For implementation detail and current architecture status, see:
- [KIPSMTHN-IMPLEMENTATION-SPEC.md](./KIPSMTHN-IMPLEMENTATION-SPEC.md)
- [docs/00-project/README.md](./docs/00-project/README.md)

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
- website presence for inquiries and discovery

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

This means the repo’s live state is the authoritative source for implementation decisions, while archival materials remain available for traceability and historical review.

---

## Design system

The platform uses shadcn/ui as its single source of truth. The official reference is [shadcn/ui components](https://ui.shadcn.com/docs/components); canonical tokens live in `src/app/globals.css`, shared primitives live in `src/components/ui/`, and the permanent rules are documented in [docs/design-system.md](./docs/design-system.md). Run `npm run design-system:check` to enforce the repository guardrails.

The platform’s UI system is centralized in `src/app/globals.css` and follows a semantic class pattern. The verified repository configuration is `radix-nova` with a stone base and CSS variables; no separate Shade CN preset identifier is present in the repository. Live product UI must not introduce purple/violet literals, legacy Hausly/Hously branding, or unsupported theme variants.

Core patterns:

- `.ui-card`
- `.ui-stat-card`
- `.ui-button-*`
- `.ui-input`, `.ui-select`, `.ui-textarea`
- `.ui-page-title`, `.ui-section-title`, `.ui-eyebrow`, `.ui-meta`

Shared UI uses the shadcn primitives and semantic theme tokens in `src/app/globals.css`.

### Current UX redesign inventory

- Public `/` is a marketing experience with audience-focused navigation and creator workspace access separated at `/admin`.
- `/admin/settings` contains only working settings destinations and the persisted global watermark studio.
- Creator profile and public portfolio remain separate, linked destinations under the authenticated workspace.
- Admin navigation uses grouped Overview, Operations, and Settings sections with responsive mobile-sheet navigation.
- Dashboard, onboarding, settings, and gallery theme defaults use semantic primary tokens instead of legacy purple styling.
- Route capabilities remain intact across clients, projects, galleries, quotes, invoices, payments, contracts, calendar, equipment, profile, portfolio, and client portals.

Validation completed for the redesign branch includes the production build, TypeScript, design-system guardrails, and the repository test suite. Browser checks confirmed public homepage layout and primary actions at mobile and desktop sizes, with no horizontal overflow after the responsive header fix. Settings page shell and profile/portfolio destinations rendered at both sizes; the persisted watermark panel could not complete because the existing local API returned HTTP 500 and the dev server later reset under repeated smoke traffic. Full authenticated smoke results remain environment-blocked, not represented as passing.

---

## Related documentation

- [KIPSMTHN-IMPLEMENTATION-SPEC.md](./KIPSMTHN-IMPLEMENTATION-SPEC.md)
- shadcn primitives in `src/components/ui/`
- [docs/00-project/README.md](./docs/00-project/README.md)
- [docs/01-specifications/README.md](./docs/01-specifications/README.md)
- [docs/02-architecture/README.md](./docs/02-architecture/README.md)
- [docs/04-security-compliance/README.md](./docs/04-security-compliance/README.md)

