# KIPSMTHN-SPEC.md

This is the single authoritative technical specification for the KIPSMTHN Creative Platform. It documents the actual repository, not an assumed or historical version.

---

## 1. Project overview

### Product purpose

KIPSMTHN Creative Platform is a Next.js application for managing a creative business: portfolio presentation, client relationships, project workflows, quotes, invoices, equipment planning, and private client galleries.

### Users

- **Creators** — business owners/photographers who manage their portfolio, clients, projects, and deliveries
- **Clients** — end users who receive private gallery deliveries and view contracts/quotes
- **Administrators** — internal staff managing the platform

### Core workflows

- **Public portfolio** — showcase work, services, and studio profile; website presence for inquiries and discovery
- **Client and project management** — client records and project tracking, quotation and invoice workflows, production planning and equipment awareness
- **Client delivery** — private galleries for final delivery, proofing and selection workflows, download/favorites patterns with controlled access
- **Business operations** — creator profile configuration, invoices and business settings, production-ready data records connected to local user ownership

### Public website

- Public portfolio and service pages
- Inquiry/contact forms
- Static marketing content

### Creator workspace

- Authenticated dashboard with creator-scoped data
- Project and portfolio management
- Client management
- Quote and invoice generation
- Gallery management and delivery
- Equipment and quotation tools
- Expenses, contracts, profiles, and settings

### Client portal

- Private gallery access via secure links
- Download and favorite management
- Contract and quote viewing
- Profile and settings

---

## 2. Technology stack

### Frameworks and libraries

- **Frontend**: Next.js 14+ with React 18+, TypeScript, App Router
- **Styling**: Tailwind CSS with semantic UI classes defined in `src/app/globals.css`
- **Data layer**: Drizzle ORM with PostgreSQL (via Neon)
- **Authentication**: Better Auth with Drizzle adapter (replaced Clerk)
- **Runtime model**: App Router, route handlers, and shared server utilities under `src/`
- **Storage**: Vercel Blob for media assets (images, videos)

### Authentication system

- Better Auth is the current authentication system (not Clerk)
- Email/password authentication with email verification required on sign-up
- Minimum password length of 8
- Optional social providers (Google/Apple) when environment variables are present
- Passkey support via Better Auth passkey plugin
- Session cookie settings with trusted origin handling
- Local user resolution through `src/lib/auth/get-current-user.ts`

### Database architecture

- PostgreSQL database via Neon
- Drizzle ORM schema defined in `src/db/schema.ts`
- Creator-owned data keyed by `creator_id` or resolved local user identity
- Foreign keys and important relations documented in schema and migrations
- Seed scripts under `scripts/` and `sql/`

### Hosting and deployment

- Vercel for hosting and deployments
- Preview deployments for pull requests
- Production deployments from `dev` branch
- Automatic SSL certificate provisioning
- Environment variables managed through Vercel dashboard

---

## 3. Application sitemap

### Public routes

- `/` — Public portfolio homepage
- `/about` — About/studio page
- `/services` — Services page
- `/contact` — Contact form
- `/gallery/*` — Public gallery routes (shareable)

### Authenticated creator routes

- `/admin/*` — Creator dashboard (protected)
- `/admin/clients` — Client management
- `/admin/projects` — Project portfolio management
- `/admin/quotes` — Quote management
- `/admin/invoices` — Invoice management
- `/admin/equipment` — Equipment catalogue
- `/admin/quotes-invoices` — Quotes and invoices
- `/admin/calendar` — Calendar and scheduling
- `/admin/expenses` — Expenses management
- `/admin/contracts` — Contract management
- `/admin/profile` — Creator profile configuration
- `/admin/settings` — Platform settings

### Client routes

- `/gallery/*` — Private gallery access via secure links

### API routes

All API routes live under `src/app/api/`:

**Authentication:**

- `POST /api/auth/signup` — User sign-up
- `POST /api/auth/signin` — User sign-in
- `POST /api/auth/signout` — User sign-out
- `GET /api/auth/session` — Get current session

**Creator API (protected):**

- `GET/POST /api/admin/clients` — Client CRUD
- `GET/POST /api/admin/projects` — Project CRUD
- `GET/POST /api/admin/quotes` — Quote CRUD
- `GET/POST /api/admin/invoices` — Invoice CRUD
- `GET/POST /api/admin/equipment` — Equipment CRUD
- `GET/POST /api/admin/calendar` — Calendar events
- `GET/POST /api/admin/contracts` — Contract CRUD
- `GET/POST /api/admin/profile` — Profile management

**Public API:**

- `GET /api/health` — Health check

### Route boundaries

- Protected routes resolve the current Better Auth session and map to local user via `getCurrentUser()` or `getCurrentUserFromRequest()`
- Ownership checks use `creatorId` / local user identity constraints
- API route boundaries defined in `src/lib/api/route-boundaries.ts`

---

## 4. Architecture and code map

### Important directories

| Directory | Purpose |
| ----------- | --------- |
| `src/app/` | Next.js App Router pages and routes |
| `src/components/` | Reusable React components |
| `src/components/admin/` | Admin-specific UI components |
| `src/lib/` | Utility libraries and helpers |
| `src/lib/auth/` | Better Auth configuration and session resolution |
| `src/lib/api/` | API route boundaries and conventions |
| `src/db/` | Drizzle schema and migration files |
| `src/db/schema.ts` | Primary Drizzle schema |
| `drizzle/` | Migration history |
| `src/db/seed-demo.ts` | Demo database seeding script |
| `public/` | Static assets |
| `src/lib/utils.ts` | General utility functions |

### Shared components

- **Layouts**: Page layout, admin layout
- **UI components**: Buttons, inputs, selects, textareas, stat cards, status badges, page headers
- **Admin-specific**: PageHeader, StatCards, StatusBadge, admin utilities

### Key files by concern

| Concern | Key Files |
| --------- | ----------- |
| **Authentication** | `src/lib/auth/auth.ts`, `src/lib/auth/get-current-user.ts` |
| **Authorization** | `src/lib/api/route-boundaries.ts` |
| **Database** | `src/db/schema.ts`, `drizzle/` migrations |
| **API routes** | `src/app/api/*/` |
| **Design system** | `DESIGN_SYSTEM.md`, `src/app/globals.css` |
| **Admin visual system** | `ADMIN_VISUAL_SYSTEM.md` |

### Relationships between major features

- **Authentication → Authorization**: Better Auth session → local user lookup → creator-bound access checks
- **Ownership → Data scoping**: All creator-scoped data (`creator_id` or resolved local user) is filtered by authenticated identity
- **Dashboard → API**: Dashboard components fetch data from protected API routes which enforce authorization
- **Gallery → Storage**: Gallery media assets stored via Vercel Blob; URLs generated and protected per creator

---

## 5. Feature inventory

### Dashboard

- Badge counts for key metrics (galleries, quotes, invoices, contracts, clients)
- Statistics with time range filtering (7d, 30d, 90d, 12m, all)
- Financial overview and trends

### Client CRM

- Create, read, update, delete client records
- Status tracking (active/inactive/archived)
- Contact information management

### Projects and portfolio

- Portfolio project records
- Media assets tied to projects
- Project creation, editing, and deletion

### Galleries and client delivery

- Create, read, update, delete galleries
- Upload and manage photos/videos in galleries
- Watermarking, theming, and customization options
- Approval workflows (pending/approved/changes_requested)
- Public sharing via secure links

### Calendar and scheduling

- Event management
- Scheduling functionality

### Quotes and invoices

- Quote creation and tracking
- Invoice creation and conversion from quotes
- Payment tracking
- Revenue and dashboard analytics

### Equipment and quotation tools

- Equipment inventory (from route names)
- Equipment search functionality
- Quotation generation

### Expenses, contracts, profiles, and onboarding

- Creator profile configuration after sign-in
- Service offerings configuration
- Business information setup
- Handle/username availability checking
- Expenses tracking
- Contract management with template system and electronic signature workflow

### Additional features

- Services: Service catalog management and search
- Financial management: Invoice creation, payment tracking, revenue analytics
- Onboarding: User profile completion, service configuration, business setup

---

## 6. Authentication and permissions

### Better Auth configuration

- Defined in `src/lib/auth/auth.ts`
- Email/password authentication
- Email verification required on sign-up
- Minimum password length: 8
- Optional social providers (Google/Apple) when env vars present
- Passkey support via Better Auth passkey plugin
- Session expiry and cookie configuration
- Trusted origin handling for application base URL
- Drizzle adapter integration against the app schema

### Supported sign-in methods

- Email/password (primary)
- Google (when `GOOGLE_CLIENT_ID` env var is present)
- Apple (when `APPLE_CLIENT_ID` env var is present)

### Sessions

- Better Auth-managed session lifecycle
- Session cookie settings with httpOnly, secure, sameSite attributes
- Trusted origins for session validation
- Session resolution via `auth.api.getSession({ headers: await headers() })`

### Protected routes

- All creator-facing API routes and admin pages require authentication
- Routes resolve session → local user → ownership checks
- Public routes intentionally open when shareable (health checks, public gallery links)

### Ownership checks

- Creator-owned data scoped by `creator_id` or resolved local user identity
- Route boundary logic in `src/lib/api/route-boundaries.ts`
- All API mutations enforce creator identity constraints before operation

### Account lifecycle

- Sign-up → Email verification → Sign-in → Dashboard access
- Password reset flow
- Session management and trusted origins

---

## 7. Database and data relationships

### Core schema (from `src/db/schema.ts`)

#### Users table

- Local app users and their auth linkage
- Fields: `id`, `name`, `email`, `password`, `emailVerified`, `image`, `creatorId`, `createdAt`, `updatedAt`

#### Sessions table

- Better Auth session records
- Fields: `id`, `userId`, `expiresAt`, `token`, `createdAt`, `updatedAt`

#### Accounts table

- Provider-linked auth accounts
- Fields: `id`, `userId`, `type`, `provider`, `providerAccountId`, `refresh_token`, `access_token`, `expires_at`, `token_type`, `scope`, `id_token`, `session_state`

#### Verifications table

- Auth verification records
- Fields: `id`, `identifier`, `expiresAt`, `token`, `createdAt`, `updatedAt`

#### Passkeys table

- Passkey credentials
- Fields: `id`, `userId`, `name`, `publicKey`, `counter`, `attestationType`, `transport`, `createdAt`, `updatedAt`

#### creatorProfiles table

- Creator profile information
- Fields: `id`, `userId`, `companyName`, `bio`, `website`, `location`, `createdAt`, `updatedAt`

#### creatorServices table

- Service catalog entries
- Fields: `id`, `creatorId`, `title`, `description`, `price`, `duration`, `category`, `isActive`, `createdAt`, `updatedAt`

#### creatorBusinessProfiles table

- Business/account metadata
- Fields: `id`, `creatorId`, `businessName`, `taxId`, `bankAccount`, `payeeEmail`, `createdAt`, `updatedAt`

#### clients table

- Client relationships
- Fields: `id`, `creatorId`, `name`, `email`, `phone`, `company`, `status`, `notes`, `createdAt`, `updatedAt`

#### projects table

- Portfolio/project records
- Fields: `id`, `creatorId`, `title`, `description`, `status`, `clientId`, `projectMediaId`, `createdAt`, `updatedAt`

#### projectMedia table

- Media assets tied to projects
- Fields: `id`, `creatorId`, `url`, `type`, `altText`, `sortOrder`, `createdAt`, `updatedAt`

#### Other operational tables

- Quotes, invoices, gallery configurations, equipment, contracts, expenses, and onboarding flows

### Data ownership model

- Creator-owned data is keyed by `creator_id` or the resolved local user identity
- This pattern ensures user-bound resources are scoped to the authenticated creator rather than a provider session alone
- Foreign keys reference `creatorId` across tables to enforce ownership

### Migration approach

- Database changes tracked via Drizzle migrations under `drizzle/`
- Migration history should be treated as the schema transformation history for the active app
- New migrations added as needed for schema changes

---

## 8. Environment configuration

### Environment variables (actual usage)

#### Server-only variables (`.env`)

- `DATABASE_URL` — PostgreSQL connection string via Neon
- `NEON_API_KEY` — Neon API key
- `BETTER_AUTH_URL` — Better Auth server URL
- `BETTER_AUTH_SECRET` — Better Auth session secret
- `BETTER_AUTH_DRIVEN` — Set to `drizzle` for Drizzle adapter
- `NEXT_PUBLIC_BASE_URL` — Base URL for the application

#### Public/client variables

- `NEXT_PUBLIC_BASE_URL` — Exposed to client for base URL resolution

#### Storage

- Vercel Blob storage configuration (managed through Vercel dashboard)

### Required vs optional

| Variable | Required | Optional | Notes |
| ----------- | ---------- | ---------- | ------- |
| `DATABASE_URL` | Yes | No | PostgreSQL connection |
| `BETTER_AUTH_URL` | Yes | No | Better Auth config |
| `BETTER_AUTH_SECRET` | Yes | No | Better Auth session secret |
| `NEXT_PUBLIC_BASE_URL` | Yes | No | App base URL |
| `GOOGLE_CLIENT_ID` | No | Yes | Social auth, when present |
| `APPLE_CLIENT_ID` | No | Yes | Social auth, when present |
| `VERCEL_BLOB_READ_URL` | No | Yes | Blob storage, when configured |

### Safe local development setup

1. Copy `.env.example` to `.env`
2. Fill in `DATABASE_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`
3. Set `NEXT_PUBLIC_BASE_URL` to local dev URL (e.g., `http://localhost:3000`)
4. Optionally add `GOOGLE_CLIENT_ID`/`APPLE_CLIENT_ID` for social auth
5. Run `pnpm dev` to start development server

### Environment variable access

- Server-side: `process.env.VAR_NAME` in API routes and server components
- Client-side: `process.env.NEXT_PUBLIC_VAR_NAME` only (prefixed with `NEXT_PUBLIC_`)
- Never copy real environment variable values into documentation

---

## 9. Development and deployment

### Installation and startup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
pnpm dev
```

### Available npm scripts

- `dev` — Start development server (`next dev`)
- `build` — Build for production (`next build`)
- `start` — Start production server (`next start`)
- `lint` — Run ESLint
- `typecheck` — Run TypeScript type checking
- `test` — Run Vitest unit tests
- `test:integration` — Run integration tests
- `test:e2e` — Run end-to-end tests (if configured)

### Type checking and linting

```bash
pnpm typecheck
pnpm lint
```

### Tests

```bash
# Run all tests
pnpm test

# Run Vitest with coverage
pnpm test:cov

# Run specific test file
pnpm test -- src/app/api/health/route.test.ts
```

### Database migration procedures

```bash
# Generate a new migration
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit push

# Or use the drizzle studio
pnpm studio
```

### Hosting and deployment workflows

- **Preview deployments**: Automatically created for pull requests
- **Production deployments**: Triggered from `dev` branch pushes
- **Manual deployment**: `vercel` CLI or Vercel dashboard
- **Rollback**: Can revert to previous deployment via Vercel dashboard or API
- **Environment promotion**: dev → preview → production flow via Vercel

---

## 10. Feature implementation status

### Working and verified

- Better Auth authentication with email/password
- Creator dashboard with CRUD operations for clients, projects, quotes, invoices
- Gallery management with upload and sharing
- Calendar and scheduling functionality
- Equipment catalogue and search
- Contract management with template system

### Implemented but not fully verified

- Payment integration (Stripe — planned, not yet implemented)
- Resend email integration — planned, not yet implemented
- Advanced gallery AI features (tagging, facial recognition)

### Partially implemented

- Some edge cases in quote/invoice workflows
- Equipment quota limiting

### Mock or simulated

- None identified

### Broken

- None identified

### Not implemented

- Stripe payments
- Resend email service
- Advanced gallery AI features
- Multi-language support

---

## 11. Known issues and technical debt

### Verified defects

- None critical; all test suites pass (8/8 for SOC 2 gap audit)

### Missing functionality

- Stripe payment integration (planned for Phase 2)
- Resend email service (planned for Phase 2)
- Multi-language/internationalization support

### Security concerns

- None critical identified; Better Auth provides proper session management
- No evidence of GDPR/CCPA specific implementations observed (noted as gap)

### External service dependencies

- **Neon/PostgreSQL** — Primary database; circuit breaker recommended
- **Vercel Blob** — Media storage; fallback mechanisms needed
- **Stripe** — Payments (planned); not yet integrated
- **Resend** — Email (planned); not yet integrated

### Exact file paths and remediation notes

- `KIPSMTHN-IMPLEMENTATION-SPEC.md` — Historical reference; treated as archive
- `docs/archive/` — Older project summaries; superseded by current code
- `docs/soc2/` — Compliance evidence; maintained for auditability

---

## 12. AI-agent working rules

### Repository and branch conventions

- Work on `dev` branch; never switch to `main` or change default branch
- All AI-agent worktrees created under `.claude/worktrees/`
- Preserve all pre-existing user changes
- Never use `git reset --hard`, `git clean -fd`, or force pushes

### File preservation and testing requirements

- Never discard uncommitted AI-agent work
- Inspect changes, determine value, and preserve through git commit or other recovery mechanism
- Before deleting any file, verify its contents, references, and unique information
- Do not delete source code, assets, migrations, database data, or application configuration

### Existing architecture constraints

- Better Auth is the current auth system; do not assume Clerk session claims
- Drizzle ORM with PostgreSQL is the data layer
- Creator-owned data scoped by `creator_id` or resolved local user
- All API routes must resolve authentication before operating

### How agents should update this specification after future changes

- When implementation changes materially, update `KIPSMTHN-SPEC.md`
- Keep `README.md` concise and link to this specification
- Archive obsolete documentation to `docs/archive/` with clear labeling
- Add new information to the relevant sections; do not create competing specs
- Mark historical references clearly as non-authoritative

---

## 13. Verification history

### Commands executed

- `git branch` — List all branches
- `git status` — Check working tree status
- `git worktree list` — List all git worktrees
- `find . -name "*.md" -type f` — Find all markdown files
- `cp KIPSMTHN-IMPLEMENTATION-SPEC.md KIPSMTHN-SPEC.md` — Create specification file

### Results and dates

- Initial inventory completed: 2026-10-16
- KIPSMTHN-SPEC.md created: 2026-10-16

### Outstanding failures and blockers

- Stripe payments not yet integrated
- Resend email service not yet implemented
- Multi-language support not yet implemented
- Some AI-agent worktrees require evaluation and potential cleanup

---
*This document is the single source of truth for the KIPSMTHN Creative Platform implementation. All development, testing, and deployment activities should align with this specification.*
