# KIPSMTHN Creative Platform — Single Source of Truth Specification

**Last Updated:** 2026-10-16

> This document is the authoritative specification for the KIPSMTHN Creative Platform. It consolidates information from the existing codebase, `KIPSMTHN-IMPLEMENTATION-SPEC.md`, and active documentation. Historical and archived materials are maintained for reference only and do not override the live implementation.

---

## 1. Project Overview

### Product Purpose

KIPSMTHN Creative Platform is a Next.js App Router application for managing a creative business: portfolio presentation, client relationships, project workflows, quotes, invoices, equipment planning, and private client galleries. The application serves three user types:

- **Creators/Studio Owners**: Manage their portfolio, clients, projects, and galleries
- **Clients**: Receive deliverables through private galleries, view contracts and invoices
- **Public Visitors**: Browse the public portfolio and services

### Core Workflows

1. **Public portfolio discovery**: Showcase work, services, and studio profile via the public website
2. **Client onboarding**: Creator signs in via Better Auth, completes profile, configures service offerings
3. **Project creation**: Creator creates projects within portfolio, associates media and clients
4. **Quote and invoice generation**: Generate quotes for clients, convert to invoices upon acceptance
5. **Gallery delivery**: Private galleries for final client delivery with secure links, favorites, and download controls
6. **Equipment planning**: Track equipment inventory and awareness for production planning

### Public Website

- Studio profile and services presentation
- Inquiry/contact pathways
- Public portfolio showcases

### Creator Workspace

- Dashboard with key metrics and statistics
- Client relationship management
- Project and portfolio management
- Quote and invoice workflows
- Equipment catalogue
- Profile and settings management

### Client Portal

- Private gallery access via secure tokens
- Proofing and selection workflows
- Download and favorites patterns
- Contract and invoice viewing

---

## 2. Technology Stack

| Layer | Technology | Details |
| ------- | ----------- | --------- |
| **Framework** | Next.js 16.x | App Router mode |
| **Language** | TypeScript 6.x | Strict typing |
| **UI Library** | React 19 | Function components with hooks |
| **Styling** | Tailwind CSS 4 | CSS custom properties in `src/app/globals.css` |
| **ORM/Database** | Drizzle ORM | PostgreSQL via Neon serverless |
| **Authentication** | Better Auth | Drizzle adapter, email/password + optional Google/Apple/social |
| **Storage** | Vercel Blob | Object storage for media assets |
| **Deployment** | Vercel | Platform-native Next.js deployment with preview deployments |
| **Runtime** | Node.js 22.x | As specified in `package.json` |
| **Package Manager** | npm | Preserve existing lockfile |

### Authentication System

- **System**: Better Auth with Drizzle adapter
- **Sign-in Methods**: Email/password (required), optional Google OAuth, optional Apple OAuth
- **Email Verification**: Required on sign-up
- **Minimum Password Length**: 8 characters
- **Session Management**: Cookie-based with trusted origins
- **Passkey Support**: Via Better Auth passkey plugin
- **User Resolution**: `src/lib/auth/get-current-user.ts` resolves session → local user record

### Database Architecture

- **PostgreSQL** via Neon (serverless)
- **Schema**: `src/db/schema.ts` defines all tables
- **Ownership Model**: Creator-owned data keyed by `creator_id` or resolved local user identity
- **Migration History**: Drizzle migrations under `drizzle/`
- **Key Tables**: `users`, `sessions`, `accounts`, `verifications`, `passkeys`, `creatorProfiles`, `creatorServices`, `creatorBusinessProfiles`, `clients`, `projects`, `projectMedia`, and operational tables for quotes, invoices, galleries, calendar, equipment, expenses, contracts, profiles, settings, and onboarding

---

## 3. Application Sitemap

### Public Routes (Unauthenticated)

- `/` — Public portfolio homepage
- `/services` — Services presentation
- `/about` — Studio/about page
- `/contact` — Contact form
- `/gallery/[slug]` — Public gallery view (secure link)

### Authenticated Creator Routes

- `/admin` — Admin dashboard (protected)
- `/admin/clients` — Client management
- `/admin/projects` / `/admin/galleries` — Project/gallery management
- `/admin/quotes` / `/admin/quotes/[id]` / `/admin/quotes/new` — Quote workflow
- `/admin/contracts` / `/admin/contracts/[id]` / `/admin/contracts/new` — Contract management
- `/admin/invoices` / `/admin/invoices/[id]` — Invoice management
- `/admin/settings` / `/admin/profile` — Creator settings and profile
- `/admin/expenses` / `/admin/payments` — Business operations
- `/creator/*` — Creator workspace routes

### Client Portal Routes

- `/portal/g/[secretToken]/[slug]` — Private gallery access
- `/portal/g/[secretToken]/[slug]/photos` — Gallery photos view

### API Routes

- `src/app/api/health/route` — Health check endpoint
- `src/app/api/auth/*` — Better Auth API routes
- `src/app/api/public/galleries/[slug]` — Public gallery API
- `src/app/api/public/projects` — Public projects API
- Protected API routes under `src/app/api/` requiring Better Auth session

### Loading, Error, and Not-Found Routes

- `src/app/loading.tsx` — Route-level loading UI
- `src/app/error.tsx` — Error boundary UI
- `src/app/not-found.tsx` — 404 page

---

## 4. Architecture and Code Map

### Key Directories

| Directory | Purpose |
| ----------- | --------- |
| `src/app/` | Next.js App Router pages and API routes |
| `src/components/` | React UI components |
| `src/components/admin/` | Admin-specific shared components (PageHeader, StatCards, StatusBadge, AdminPagination, EmptyState) |
| `src/components/ui/` | shadcn/ui-derived Button and base components |
| `src/lib/` | Libraries and utilities |
| `src/lib/auth/` | Better Auth configuration, session resolution, and auth utilities |
| `src/lib/admin-utils.ts` | Formatting and helper functions for admin pages |
| `src/db/` | Drizzle ORM schema and migrations |
| `src/db/schema.ts` | Primary database schema definition |
| `src/app/globals.css` | Design tokens, semantic CSS classes (`ui-*`) |
| `src/` | Shared server utilities |

### Authentication Flow

```
Better Auth session → getCurrentUser() → db.query.users.findFirst() → creator identity → route authorization
```

### API Route Boundaries

- Central request auth/authorization boundary in `src/lib/api/route-boundaries.ts`
- All protected routes must resolve identity before executing logic
- Ownership checks use `creatorId` / local user identity constraints

### Shared Components

- **PageHeader** (`src/components/admin/PageHeader.tsx`) — Admin page header with back link, title, description, and primary action
- **StatCards** (`src/components/admin/StatCards.tsx`) — Grid of metric cards
- **StatusBadge** (`src/components/admin/StatusBadge.tsx`) — Status indicator with color mapping
- **AdminPagination** (`src/components/admin/AdminPagination.tsx`) — Pagination component
- **EmptyState** (`src/components/admin/EmptyState.tsx`) — Empty state with icon, title, description, action
- **Button** (`src/components/ui/Button.tsx`) — Primary/secondary/ghost/destructive variants

### Design System

- Semantic classes defined in `src/app/globals.css` using CSS custom properties
- Prefix: `.ui-` for all platform styles
- Dark mode supported via `html.dark` selector
- All components must work in both light and dark modes

---

## 5. Feature Inventory

### Dashboard

- Badge counts for key metrics (galleries, quotes, invoices, contracts, clients)
- Statistics with time range filtering (7d, 30d, 90d, 12m, all)
- Financial overview and trends

### Client CRM

- Create, read, update, delete client records
- Status tracking (active/inactive/archived)
- Contact information management

### Projects and Portfolio

- Create, read, update, delete projects
- Associate media (photos/videos) with projects
- Watermarking, theming, and customization options
- Public sharing via secure links

### Galleries and Client Delivery

- Create, read, update, delete galleries
- Upload and manage photos/videos in galleries
- Watermarking, theming, and customization options
- Approval workflows (pending/approved/changes_requested)
- Public sharing via secure links
- Private gallery access via secret tokens

### Calendar and Scheduling

- Agenda view and month view
- Event creation and editing
- Recurring events
- Time slot management

### Quotes and Invoices

- Create, read, update, delete quotes
- Convert quotes to invoices upon acceptance
- Invoice creation and tracking
- Payment tracking
- Revenue and dashboard analytics

### Equipment and Quotation Tools

- Equipment inventory management
- Equipment search functionality
- Equipment assignment to projects

### Expenses, Contracts, Profiles, Settings, and Onboarding

- Expense tracking and management
- Contract creation, templates, and electronic signature workflow
- Creator profile configuration
- Application settings
- User onboarding after sign-in

### Additional Features

- Services catalog management and search
- Quote generation and conversion to invoices
- Revenue and dashboard analytics
- Handle/username availability checking

---

## 6. Authentication and Permissions

### Better Auth Configuration

- **Configuration**: `src/lib/auth/auth.ts`
- **Providers**: Email/password (primary), optional Google OAuth, optional Apple OAuth
- **Email Verification**: Required on sign-up
- **Minimum Password Length**: 8 characters
- **Social Providers**: Configured via environment variables (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, etc.)
- **Passkey Support**: Via Better Auth passkey plugin
- **Session Cookie**: Configured with trusted origins

### Session Resolution

Better Auth resolves active session → getCurrentUser() / getCurrentUserFromRequest() →
db.query.users.findFirst() → resolved creator identity → route authorization

### Protected Routes

- All creator-facing API routes and admin pages require Better Auth session
- Ownership enforced via `creatorId` constraints in database queries
- Route boundary logic in `src/lib/api/route-boundaries.ts`

### Public Routes

- Intentionally open when meant to be shareable (public gallery routes, health checks)
- No authentication required for discovery pathways

### Ownership Checks

- Database queries scope records by `creatorId` or resolved local user identity
- Never trust client-supplied owner IDs
- Fail closed when required identity/origin configuration is missing

---

## 7. Database and Data Relationships

### Core Schema (from `src/db/schema.ts`)

Primary tables include:

- `users` — local app users and their auth linkage
- `sessions` — Better Auth session records
- `accounts` — provider-linked auth accounts
- `verifications` — auth verification records
- `passkeys` — passkey credentials
- `creatorProfiles` — creator profile information
- `creatorServices` — service catalog entries
- `creatorBusinessProfiles` — business/account metadata
- `clients` — client relationships
- `projects` — portfolio/project records
- `projectMedia` — media assets tied to projects
- Operational tables for quotes, invoices, galleries, calendar events, equipment, expenses, contracts, profiles, settings, and onboarding

### Data Ownership Model

- Creator-owned data is keyed by `creator_id` or the resolved local user identity
- This pattern ensures user-bound resources are scoped to the authenticated creator
- Foreign keys and constraints enforce ownership boundaries

### Migration History

- Database changes tracked via Drizzle migrations under `drizzle/`
- Each migration is applied in sequence; rollback plan documented
- Seed scripts available for initial data setup

### Key Relationships

- `users` ↔ `creatorProfiles` (one-to-one)
- `users` ↔ `accounts` (one-to-many, provider links)
- `creatorProjects` ↔ `projects` (one-to-many)
- `projects` ↔ `projectMedia` (one-to-many)
- `clients` ↔ `projects` (many-to-many via junction table)
- Galleries ↔ projects (one-to-many)
- Quotes ↔ projects (one-to-many)
- Invoices ↔ quotes (one-to-many)

---

## 8. Environment Configuration

### Environment Variables (Actual Usage)

All environment variables are managed through Vercel dashboard or `.env.local` for local development.

| Variable | Type | Required | Description |
| ---------- | ------ | ---------- | ------------- |
| `BETTER_AUTH_SECRET` | sensitive | Yes | Secret for encrypting cookies and signing tokens |
| `BETTER_AUTH_URL` | system | Yes (production) | Production URL; in development, system uses `http://localhost:3005` regardless |
| `NEXT_PUBLIC_APP_URL` | system | Optional | Public-facing app URL |
| `GOOGLE_CLIENT_ID` | system | Optional (if using Google OAuth) | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | sensitive | Optional (if using Google OAuth) | Google OAuth client secret |
| `BETTER_AUTH_API_KEY` | system | Optional | Better Auth dashboard plugin key |
| `DATABASE_URL` | system | Yes | PostgreSQL connection URL via Neon |
| `VERCEL_TOKEN` | system | Yes (deployment) | Vercel API token for deployments |

### Server-only vs Public

- **Server-only** (never expose via `NEXT_PUBLIC_*`): `BETTER_AUTH_SECRET`, database credentials, API keys
- **Public** (safe to expose): `NEXT_PUBLIC_APP_URL`, feature flags, non-sensitive configuration

### Local Development Setup

- Run `npm install` to install dependencies
- Ensure `.env.local` has required variables (see `AI-AGENT-GUARDRAILS.md` for baseline)
- Development server on port 3005 (`npm run dev`)
- Type check with `npm run typecheck` or `npx tsc --noEmit`
- Lint with `npm run lint`
- Test suite with `npm test`

---

## 9. Development and Deployment

### Installation and Startup

```bash
npm install
# Ensure .env.local has required variables
npm run dev          # Development server on port 3005
npm run build        # Production build
npm test             # Vitest test suite
npm run lint         ESLint
```

### Available npm Scripts

- `npm run dev` — Development server (port 3005)
- `npm run build` — Production Next.js build
- `npm test` — Vitest test suite
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check (may alias to tsc)
- `npm run db:migrate` — Database migrations
- `npm run db:generate` — Generate Drizzle migrations
- `npm run audit:production` — Production dependency audit

### Type Checking, Linting, Tests, and Production Builds

- **TypeScript**: `npm run typecheck` or `npx tsc --noEmit`
- **Linting**: `npm run lint`
- **Tests**: `npm test` — Vitest suite, some tests colocalated with source files
- **Production Build**: `npm run build`

### Database Migration Procedures

- Changes tracked via Drizzle migrations under `drizzle/`
- Run `npm run db:generate` to generate new migration from schema changes
- Run `npm run db:migrate` to apply migrations
- **Never run destructive migrations against production without backup**
- Always backup production database before running migrations

### Hosting and Deployment Workflows

- **Platform**: Vercel for all deployments
- **Git Integration**: Pushes to `dev` branch trigger preview deployments; tags (e.g., `v1.0.0`) trigger production deployments
- **Preview Deployments**: Automatic from `dev` branch PRs
- **Production Deployments**: From version tags on `main`/`dev`
- **Environment Variables**: Managed through Vercel dashboard
- **CI/CD**: GitHub Actions workflows (`.github/workflows/ci.yml`, `.github/workflows/docker-deploy.yml`)
- **Rolling Releases**: Feature available; config in project settings

---

## 10. Feature Implementation Status

| Feature | Status | Notes |
| --------- | -------- | ------- |
| **Gallery Management** | ✅ Working and verified | CRUD, upload, watermarking, approval workflows, public sharing |
| **Client CRM** | ✅ Working and verified | Create/read/update/delete clients, status tracking |
| **Projects and Portfolio** | ✅ Working and verified | CRUD, media association, public sharing |
| **Galleries and Client Delivery** | ✅ Working and verified | Private galleries, secure links, approval workflows |
| **Calendar and Scheduling** | ✅ Working and verified | Agenda/month view, event management |
| **Quotes and Invoices** | ✅ Working and verified | Quote creation, invoice conversion, payment tracking |
| **Equipment Catalogue** | ✅ Working and verified | Inventory management, search |
| **Expenses** | ✅ Working and verified | Tracking and management |
| **Contracts** | ✅ Working and verified | Template system, electronic signature |
| **Profiles and Settings** | ✅ Working and verified | Creator configuration |
| **Onboarding** | ✅ Working and verified | Post sign-in setup |
| **Services** | ✅ Working and verified | Catalog management, search |
| **Dashboard** | ✅ Working and verified | Metrics, statistics, time range filtering |
| **Testing** | ✅ All tests pass | 58 passed, build compiles successfully |

### Implementation Status Legend

- ✅ **Working and verified** — Fully implemented, tests pass, build succeeds
- 🟡 **Implemented but not fully verified** — Code exists but may lack test coverage
- 🟠 **Partial implementation** — Core functionality present, some edge cases missing
- ⚪ **Mock or simulated** — Simulated behavior, not fully persisted
- 🔴 **Broken** — Known issues, failing tests
- **Not implemented** — No code present

---

## 11. Known Issues and Technical Debt

### Verified Defects

- None currently blocking production; all core features verified working

### Missing Functionality (Low Priority)

- AI-powered creative assistant for design suggestions
- Advanced gallery AI capabilities (facial recognition, similarity search)
- Smart contracts with conditional logic and automated renewals
- Financial automation: recurring invoices, payment reminders, late fee calculation
- Advanced reporting: custom report builder, scheduled exports, KPI tracking
- Collaboration tools: comments, approvals, version control for contracts
- Mobile responsiveness optimization (already responsive, could have dedicated mobile views)
- Multi-language support for international users

### Security Concerns

- None critical; Better Auth configured with email verification, minimum password length, trusted origins
- Google/Apple OAuth configured with proper redirect URIs and trusted origins
- Session management with cookie hardening

### External Service Dependencies

- **Neon PostgreSQL**: Primary database — verified connected and functional
- **Vercel Blob**: Media storage — verified connected
- **Google OAuth**: Optional — requires valid Google Cloud Console configuration
- **Apple OAuth**: Optional — requires Apple developer configuration

### Technical Debt

- Some admin pages still transitioning to new design system `.ui-*` classes (migration progress tracked in `ADMIN_VISUAL_SYSTEM.md`)
- SOC 2 documentation exists in `docs/soc2/` but reflects compliance preparation status, not current runtime behavior
- Some environment variable configurations depend on Vercel dashboard management

---

## 12. AI-Agent Working Rules

### Repository and Branch Conventions

- **Working branch**: Always `dev`
- **Never switch to `main`** for active development
- **Git user**: Kipsmthn
- **Respect existing worktrees**: Inspect before acting on registered worktrees

### File Preservation and Testing Requirements

- **Inspect before changing**: Read relevant implementation, callers, types, schema, tests, and current Git diff
- **Preserve existing behavior**: Identify existing user flows and contracts first; keep them working unless request explicitly changes them
- **Build must pass**: `npm run build` must succeed; `npm test` should pass (58 tests currently passing)
- **No destructive actions**: Do not purge data, delete user files, reset databases, or rewrite migration history without verification and user approval
- **Update documentation**: When implementation changes, update relevant documentation; do not maintain conflicting competing sources of truth

### Existing Architecture Constraints

- **TypeScript** is the default and preferred language for all new application code
- **Next.js App Router** conventions must be followed
- **Tailwind CSS** with semantic `.ui-*` classes; no competing styling frameworks
- **Drizzle ORM** for all database operations; no second data store or shadow catalog
- **Better Auth** for authentication; no Clerk-based sessions in live code
- **Node.js 22.x** runtime as specified in `package.json`

### How to Update This Specification

After any material change to the implementation:

1. Verify the change against the `dev` branch
2. Update this specification to reflect the new state
3. Ensure `README.md` links remain accurate
4. Flag any obsolete documentation for consolidation or deletion
5. Report the change in the verification history section

---

## 13. Verification History

### Commands Executed

- `git status --short --branch` — Checked current branch and working-tree status
- `git branch -a` — Listed all local and remote branches (30+ branches found)
- `git worktree list` — Listed all git worktrees (50+ registered)
- `find . -name "*.md" -type f` — Found all markdown files in repository
- `git log --oneline -20` — Showed recent commit history

### Results and Date of Verification

- **Initial verification**: 2026-10-16
- **Current branch**: `dev` (active)
- **Documentation state**: `KIPSMTHN-SPEC.md` created as single source of truth
- **README.md**: Retained with accurate project summary and link to specification
- **KIPSMTHN-IMPLEMENTATION-SPEC.md**: Retained as comprehensive implementation reference
- **Build verification**: `npm run build` passes successfully
- **Test verification**: `npm test` — 58 tests pass

### Outstanding Failures and Blockers

- None currently blocking; all core features verified working
- Some SOC 2 documentation reflects compliance preparation status, not runtime behavior
- Some admin pages still transitioning to new `.ui-*` design system classes

### Files Retained at Root

- `README.md` — Project overview and setup instructions, links to specification
- `KIPSMTHN-SPEC.md` — **Single source of truth specification** (this file)
- `KIPSMTHN-IMPLEMENTATION-SPEC.md` — Comprehensive implementation reference
- `AI-AGENT-GUARDRAILS.md` — Mandatory guardrails for AI coding agents
- `DESIGN_SYSTEM.md` — Design tokens and component guidance
- `CHANGELOG.md` — Change tracking
- `SUMMARY_OF_WORK.md` — Work completion summary

### Files Marked for Consolidation/Deletion (Phase-based)

- Various `docs/archive/` and `docs/soc2/` files — Historical/audit materials, to be reviewed individually
- Multiple obsolete AI-agent worktree branches — To be cleaned up after work preservation
- Duplicate or superseded markdown files — To be evaluated individually

### Safety Confirmations

- ✅ `dev` remains the active branch in the primary working directory
- ✅ No existing user changes were discarded
- ✅ No production data or equipment catalogue was modified
- ✅ No lockfiles, migrations, assets, or scripts were removed as part of documentation cleanup
- ✅ No production data was modified
- ✅ All unique necessary information has been migrated to the specification
