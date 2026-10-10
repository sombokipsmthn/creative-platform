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

The platform’s UI system is centralized in `src/app/globals.css` and follows a semantic class pattern.

Core patterns:

- `.ui-card`
- `.ui-stat-card`
- `.ui-button-*`
- `.ui-input`, `.ui-select`, `.ui-textarea`
- `.ui-page-title`, `.ui-section-title`, `.ui-eyebrow`, `.ui-meta`

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for the active design token and component guidance.

---

## Related documentation

- [KIPSMTHN-IMPLEMENTATION-SPEC.md](./KIPSMTHN-IMPLEMENTATION-SPEC.md)
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- [docs/00-project/README.md](./docs/00-project/README.md)
- [docs/01-specifications/README.md](./docs/01-specifications/README.md)
- [docs/02-architecture/README.md](./docs/02-architecture/README.md)
- [docs/04-security-compliance/README.md](./docs/04-security-compliance/README.md)

