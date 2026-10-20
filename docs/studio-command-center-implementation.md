# KIPSMTHN Studio Command Center Implementation

## Feature objective

Build a phased Studio Command Center for `/admin` that combines operational KPIs, production scheduling, authorized calendar events, financial milestones, a priority queue, and supported client-event operations. The implementation must extend the existing KIPSMTHN Creative OS rather than introduce a parallel visual system.

## Phase 0 checkpoint: repository reconnaissance

### Repository and branch

- Repository: `creative-platform` in the current worktree.
- Current checked-out branch: `Calendar-Fix`.
- Required reference branch: `dev`, inspected with `git show dev:<path>` because switching branches would risk existing uncommitted work.
- Existing unrelated worktree changes are preserved:
  - `docs/reports/settings-persistence-verification.md`
  - `package.json`
  - `scripts/authenticated-settings-smoke.mjs`
  - `src/app/api/galleries/[id]/route.ts`
  - `scripts/gallery-watermark-smoke.mjs`
- No database reset, cleanup, commit, push, or deployment was performed.

### Design-system references discovered

- Global tokens and themes: `src/app/globals.css`.
- Tailwind CSS v4 is configured through `src/app/globals.css`; no `tailwind.config.*` file is present.
- Component metadata: `components.json` uses shadcn/Radix Nova, CSS variables, `src/app/globals.css`, and Remix Icon metadata.
- Runtime font: `Outfit` through `next/font/google`, exposed as `--font-sans` in `src/app/layout.tsx`.
- Global fallback imports include Plus Jakarta Sans and JetBrains Mono.
- Core tokens include `--background`, `--foreground`, `--card`, `--muted`, `--primary`, `--secondary`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, chart tokens, sidebar tokens, and `--radius`.
- Dark theme is activated by `.dark`; the root layout currently applies the `dark` class and `ThemeScript` supports theme behavior.
- Shared semantic classes include `.ui-page`, `.ui-shell`, `.ui-card`, `.ui-panel`, `.ui-stat-card`, `.ui-input`, `.ui-badge`, `.ui-button`, and typography classes.
- Shared admin conventions include `.admin-page-header`, `.admin-page-title`, `.admin-page-actions`, `.admin-tabs`, `.admin-filter-bar`, `.admin-search`, `.admin-filter-controls`, `.admin-empty-state`, `.admin-stat-card`, and `.status-badge`.
- Existing admin components to reuse: `src/components/ui/AdminPageHeader.tsx`, `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/ui/dialog.tsx`, `src/components/ui/sheet.tsx`, `src/components/ui/input.tsx`, `src/components/ui/select.tsx`, `src/components/ui/tabs.tsx`, `src/components/ui/skeleton.tsx`, `src/components/admin/StatCards.tsx`, `TableFilterBar.tsx`, `StatusBadge.tsx`, `EmptyState.tsx`, and `AdminPagination.tsx`.
- Existing responsive breakpoints are primarily 640px, 768px, and 1024px. Admin navigation uses a fixed 260px desktop sidebar and a Radix Sheet mobile navigation.
- Existing admin page patterns use an 80rem `.ui-shell`, responsive page headers, shadcn cards/buttons, muted surfaces, subtle borders/shadows, and accessible loading/error/empty states.
- Existing modal and drawer primitives are Radix Dialog and Sheet. No date-picker component was found.

### Existing navigation, calendar, and dashboard

- Admin navigation is defined in `src/app/admin/layout.tsx`; Calendar is already under Operations at `/admin/calendar`.
- `src/app/admin/dashboard/page.tsx` redirects to `/admin`; the actual dashboard is `src/app/admin/page.tsx`.
- The dashboard already loads real `/api/dashboard/stats` data and uses KPI cards, quick actions, activity rows, Skeleton, Alert, and shared shadcn primitives.
- The current `/admin/calendar/page.tsx` is a client component with month, week, and agenda views, date-fns navigation, loading/error states, and `/api/calendar` fetching. It contains many empty class names and hardcoded purple/slate/zinc styling, so Phase 1 should align it to shared tokens without redesigning unrelated pages.
- `src/components/admin/ProductionCalendar.tsx` is an older project-only monthly calendar using `/api/projects/calendar`; it is a reusable data reference but not a complete command-center surface.
- No existing date-picker component was found. Date-range selection will need a small command-center-specific control built from existing button/input primitives unless a dependency is introduced later.

### Auth and authorization patterns

- Better Auth is configured in `src/lib/auth/auth.ts` using the Drizzle adapter, email/password, optional Google/Apple providers, passkeys, cookie sessions, and trusted origins.
- `src/lib/auth/get-current-user.ts` resolves Better Auth sessions to local creator records and supports the development `local-auth-bypass=1` cookie only in development.
- API creator scoping is standardized through `withCreatorApi` in `src/lib/api/route-boundaries.ts`; it returns 401 without a local user and passes the authenticated user ID to handlers.
- Existing calendar, clients, projects, quotes, and invoices APIs use `withCreatorApi` and filter by `creatorId`.
- Resource ownership helpers exist in `src/lib/auth/better-auth.ts`, including client and gallery ownership checks. New command-center operations must use the same creator boundary and validate related records under that creator.
- `src/lib/roles.ts` provides the current admin-role check based on `ADMIN_EMAIL`; do not add a second authorization model.

### Existing data sources and relationships

- `users` owns creator-scoped records through `creatorId`.
- `clients` belongs to a creator and is referenced by projects, quotes, invoices, galleries, and contracts.
- `projects` belongs to a creator, optionally references a client, and already has nullable `startDate` and `endDate` fields.
- `quotes` belongs to a creator, optionally references a client, has `validUntil`, status, totals, currency, and an optional `invoiceId`.
- `invoices` belongs to a creator, references a client and optional quote, and has `issueDate`, nullable `dueDate`, status, totals, and currency.
- `invoiceItems` contain line-item amounts, but no authoritative payment ledger or recorded payment amount table was found.
- `galleries` belongs to a creator and optionally references a client and project; `publishedAt` and `expiresAt` are available milestones.
- `contracts` belongs to a creator and references a client, project, and quote; `expiresAt`, sent, viewed, signed, declined, and cancelled timestamps are available.
- No persistent generic client-event/calendar-event table was found.
- No authoritative booking/shoot model or payment-record model was found. These are blockers for real booking events, payment deadlines, partial-payment calculations, and persistent client events.
- Existing `src/app/api/calendar/route.ts` aggregates quotes, invoices, overlapping projects, galleries, and contracts, but its category filtering and event relationship mapping are incomplete and require careful replacement or extraction into a typed server aggregation layer.

## Planned phases and acceptance criteria

### Phase 1 — Design-system-aligned interface foundation

- Build the command-center shell inside the existing admin layout.
- Reuse `AdminPageHeader`, `Button`, `Card`, `StatCards`, `TableFilterBar` patterns, `StatusBadge`, `EmptyState`, `Skeleton`, Dialog, and Sheet.
- Establish header actions, KPI cards, calendar navigation/view controls, category indicators, detail panel layout, responsive states, and theme-safe styling.
- Use isolated fixture data only in clearly named presentation fixtures, if required.
- Acceptance: the page renders at supported breakpoints, uses existing tokens/components, supports loading/error/empty foundations, and has no production-data fixture path.

### Phase 2 — Real calendar data and date navigation

- Replace the current untyped aggregation with a typed server event layer.
- Integrate projects and reliable quote, invoice, gallery, and contract milestones.
- Support month, week, day, and agenda only where the current stack can maintain stable behavior; preserve the existing supported views while expanding safely.
- Add Today, navigation, range selection, category/client/project filters, record links, tenant scoping, and fixture removal.
- Decide whether the smallest required persistent event model is necessary after confirming the absence of a booking/event source.
- Acceptance: authorized real records display correctly, navigation and filters work, and every event resolves to its source record.

### Phase 3 — Financial timeline and business rules

- Derive quote requested/sent/approved/declined/expiry events from real quote fields and status history available in the repository.
- Derive invoice issue/sent/due events from invoice fields and existing workflow state.
- Keep invoice expiry distinct from overdue; calculate overdue from due date, status, and outstanding authoritative balance.
- First resolve the missing payment ledger/source before implementing partial-payment or payment-deadline claims.
- Preserve existing quote/invoice services and test date/status calculations, currencies, and timezone behavior.
- Acceptance: displayed financial milestones agree with records, or unsupported payment states are explicitly blocked and documented.

### Phase 4 — Command center overview and priority queue

- Connect KPI cards and priority items to one shared aggregation/calculation layer.
- Prioritize overdue invoices, expiring quotes, upcoming project dates, and approaching contract/gallery deadlines.
- Link all items to source records and deduplicate by source and milestone.
- Acceptance: the overview uses live authorized data and clearly answers current activity, risk, and next actions.

### Phase 5 — Event management and operational interactions

- Add a persistent event model only if required after Phase 2 source verification.
- Implement supported client-event creation/editing/rescheduling, notes, relationships, conflict detection, completion/cancellation behavior, validation, and authorization.
- Keep derived financial events read-only and refresh affected queries after changes.
- Acceptance: supported mutations persist safely, source relationships remain correct, and failure states are visible.

### Phase 6 — Styling polish, responsive QA, and regression testing

- Compare the completed command center with existing admin pages.
- Correct typography, spacing, tokens, borders, shadows, radii, themes, responsive layouts, focus states, labels, filters, navigation, timezone boundaries, authorization, lint, TypeScript, tests, and production build.
- Update this document with exact verified results and remaining blockers.
- Acceptance: applicable checks pass, with pre-existing failures precisely documented.

## Expected files to change

### Likely existing files

- `src/app/admin/calendar/page.tsx` or a new command-center page under `src/app/admin/`
- `src/app/admin/page.tsx` for dashboard/overview integration if required
- `src/app/admin/layout.tsx` only if navigation labeling or command-center placement requires it
- `src/app/api/calendar/route.ts`
- New focused API route(s) under `src/app/api/calendar/` only when needed
- New typed aggregation/calculation service under `src/lib/services/` or `src/lib/calendar/`
- `src/components/admin/ProductionCalendar.tsx` only if safely promoted or replaced
- Shared component extensions under `src/components/admin/` or `src/components/ui/`
- Focused tests adjacent to calendar services/API routes
- `src/db/schema.ts` and a Drizzle migration only if Phase 2 or Phase 5 proves a persistent event/payment model essential
- This progress document after every phase

### Files explicitly not planned for unrelated changes

- Existing gallery/settings worktree changes listed above
- Unrelated public pages, gallery workflows, contract workflows, or global redesigns
- Database reset scripts or destructive cleanup

## Completed work

### Phase 0 — Repository reconnaissance

- Confirmed the current repository worktree and preserved its uncommitted changes.
- Inspected the `dev` branch directly for the required design-system reference.
- Inspected current calendar, admin layout/navigation, dashboard, auth, authorization, schema, and financial API/service patterns.
- Identified reusable UI primitives and the absence of a date-picker, generic persistent event model, booking source, and payment ledger.
- Created this Phase 0 progress document.

### Phase 1 — Design-system-aligned interface foundation

- Replaced the calendar page presentation layer in `src/app/admin/calendar/page.tsx` with a command-center shell using `AdminPageHeader`, shadcn `Card`, `Button`, `Badge`, `Skeleton`, and existing `StatusBadge` components.
- Added four operational summary cards for visible events, projects, financial milestones, and review-needed statuses.
- Added responsive calendar workspace navigation, Today, previous/next controls, Month/Week/Agenda tabs, and category filters.
- Added token-based event category indicators for projects, quotations, invoices, galleries, and contracts.
- Added responsive month, week, and agenda foundations with accessible event buttons and source-status treatments.
- Added an event detail panel foundation showing category, date, status, notes, and source identity without mutating records.
- Added loading skeletons, empty states, retry feedback, abort-safe fetching, and accessible labels/focus states.
- Removed the page's empty class names and hardcoded purple/slate/zinc visual treatment; the page now uses shared theme tokens and responsive utility conventions.
- Kept the existing `/api/calendar` read path unchanged; no fixtures, schema changes, or production data mutations were introduced.

### Phase 2 — Real calendar data and typed date navigation foundation

- Added `src/lib/services/calendar.ts` as a typed server-side aggregation layer for projects, quotes, invoices, galleries, and contracts.
- Added strict date-range parsing and rejection of missing, invalid, or reversed ranges.
- Added normalized category handling, including `quotation` to `quote`, and explicit rejection of unknown categories.
- Added creator-scoped parallel queries through the existing authenticated route boundary.
- Corrected project overlap filtering to require non-null schedule dates and include records spanning the requested range.
- Corrected source event IDs to use stable `sourceType:sourceId` identities.
- Corrected related-record mappings so events only reference real relationships from their source row; fabricated project, invoice, and gallery IDs were removed.
- Excluded quote, invoice, gallery, and contract rows without authoritative milestone dates.
- Preserved existing milestone semantics: project schedule, quote validity, invoice due date, gallery publication, and contract expiry.
- Replaced the untyped `/api/calendar` aggregation route with validated parameter handling and the typed service.
- Added `src/lib/services/calendar.test.ts` covering range validation, category normalization, source relationships, null-date exclusion, source identities, and chronological ordering.
- Made no schema or database changes because no authoritative booking/event or payment source exists.

### Phase 2 — Real calendar data and typed date navigation foundation

- Added `src/lib/services/calendar.ts` as a typed server-side aggregation layer for projects, quotes, invoices, galleries, and contracts.
- Added strict date-range parsing and rejection of missing, invalid, or reversed ranges.
- Added normalized category handling, including `quotation` to `quote`, and explicit rejection of unknown categories.
- Added creator-scoped parallel queries through the existing authenticated route boundary.
- Corrected project overlap filtering to require non-null schedule dates and include records spanning the requested range.
- Corrected source event IDs to use stable source identities.
- Corrected related-record mappings so events only reference real relationships from their source row; fabricated project, invoice, and gallery IDs were removed.
- Added client and project filtering to the command-center UI and authorized calendar query path.
- Added source-record navigation from event details to the existing project, quote, invoice, gallery, and contract pages.
- Excluded records without authoritative milestone dates.
- Added `src/lib/services/calendar.test.ts` covering range validation, category normalization, source relationships, null-date exclusion, source identities, and chronological ordering.
- Made no schema or database changes because no authoritative booking/event or payment source exists.

### Phase 5 — Persistent studio-event operations

- Added `studio_events` to `src/db/schema.ts` with creator scoping, optional client/project relationships, title, description, event type, status, start/end timestamps, all-day flag, location, and indexes.
- Added non-destructive migration `drizzle/0035_studio_events.sql` using `CREATE TABLE IF NOT EXISTS` and indexed foreign-key columns.
- Added authenticated `GET` and `POST` handlers at `/api/calendar/events`.
- Added authenticated `PATCH` and `DELETE` handlers at `/api/calendar/events/[id]`.
- Validated creator ownership for clients and projects before linking events.
- Validated event titles, dates, date ordering, and source relationships.
- Integrated persisted studio events into the typed calendar aggregation and category filters.
- Added edit and delete controls for persisted studio events with confirmation, busy state, refresh behavior, and creator-scoped API calls.
- Kept derived financial and source-record events read-only.

### Zero-state visuals for unavailable dependencies

- Added payment-ledger zero state explaining that invoice dates remain visible while balances and partial payments are unavailable.
- Added booking-source zero state explaining that no external bookings are inferred and manual New event scheduling is available.
- Kept both states informational and clearly distinct from live business records.

- No payment ledger was added because payment semantics, reconciliation rules, payment methods, and authoritative recorded-payment requirements are not defined in the existing application.
- Invoice due dates remain visible, but outstanding balances, partial payments, and payment deadlines are not claimed.

### Phase 6 — Verification

- Verified lint, TypeScript, full tests, production build, and diff integrity.
- Existing user changes and unrelated database repair files remain untouched.

## Final status and remaining blockers

- Current phase: supported command-center implementation complete through studio-event CRUD; payment-ledger work remains blocked pending business rules and authoritative payment requirements.
- Implemented: themed command-center UI, responsive calendar views, loading/error/empty states, category/client/project filters, authorized aggregation, source links, project schedules, quote validity milestones, invoice due milestones, gallery publication milestones, contract expiry milestones, persistent studio events, and creator-scoped event CRUD with edit/delete controls.
- Blocked: payment history, partial payments, outstanding balances, payment deadlines, payment-derived overdue calculations, and payment priority items.
- Required next data decision: define the authoritative payment ledger and reconciliation rules before adding payment schema or calculations.

## Commands and checks executed

- `git branch --show-current && git status --short --branch && git log -1 --oneline`
  - Result: current branch `Calendar-Fix`; unrelated uncommitted changes present.
- `git branch -a --no-color`
  - Result: local `dev` and `origin/dev` are available.
- `git ls-tree -r --name-only dev ...`
  - Result: `dev` contains the calendar, admin, auth, schema, and shared component paths inspected.
- `git show dev:src/app/globals.css`
  - Result: confirmed the reference tokens, theme, semantic classes, and admin CSS conventions.
- `git show dev:package.json`
  - Result: confirmed Next.js, React, Tailwind v4, date-fns, Radix/shadcn, Better Auth, Drizzle, and available scripts.
- `npm run db:migrate`
  - Result: reported success but skipped `0035_studio_events.sql` because the existing database journal already uses the conflicting migration ID.
- Direct transaction applying `drizzle/0035_studio_events.sql`
  - Result: completed successfully; verified `public.studio_events` and its four creator/client/project/start-time indexes.
- `npm test`
  - Result: passed; 13 test files and 64 tests.
- `npm run lint`
  - Result: passed.
- `npx tsc --noEmit`
  - Result: passed.
- `npm run build`
  - Result: passed; production build compiled, TypeScript completed, and all 72 static pages generated.
- `git diff --check`
  - Result: passed.
- No database reset, destructive cleanup, commit, push, or deployment was performed.

## Payment ledger implementation

- Added integer minor-unit `payments`, `payment_schedules`, `payment_term_amendments`, and `payment_audit_events` tables in `src/db/schema.ts`.
- Added migration `drizzle/0038_payment_ledger.sql` and journal entry `0038_payment_ledger`.
- Added creator-scoped manual payment recording at `/api/payments`.
- Added invoice payment summaries at `/api/invoices/[id]/payments`.
- Added verification, reversal, and audit-event actions at `/api/payments/[id]`.
- Confirmed payments alone reduce invoice balances; pending, failed, cancelled, reversed, and refunded records do not.
- Blocked currency mismatches and confirmed over-allocation server-side.
- Added invoice-detail financial summaries and manual Record payment form.
- Replaced the payments placeholder with a ledger-backed payments overview.
- Kept provider integration neutral; no SDK, credentials, webhooks, or live payment processing were added.

## Payment ledger follow-up completion

- Payment schedules and term-amendment tables are present; dedicated editing APIs/UI remain outside the current invoice form scope.
- Immutable payment audit records are written for creation, verification, and reversal; a dedicated audit timeline UI remains a follow-up.
- Refund policy: refunds are represented as explicit future financial events, not destructive edits or successful payments. No refund mutation is exposed until refund accounting and approval rules are finalized.
- Overpayment policy: confirmed payments cannot exceed the invoice total; overpayments are rejected with a clear validation error.
- Provider, webhook, email-ingestion, and automated-verification work remains deferred.

## Known blockers and remaining tasks

- The requested `dev` branch is not checked out; current work must avoid switching branches because the worktree contains user changes.
- No authoritative booking/shoot table was found, so real booking events cannot be integrated yet.
- No payment ledger or recorded-payment model was found, so partial payments and outstanding balances need a confirmed source before implementation.
- No generic persistent client-event model was found; Phase 2 must decide whether adding one is essential.
- The current calendar endpoint uses broad `any` event objects, placeholder category filtering, and questionable related-record mappings; it needs a typed redesign in a later phase.
- The current calendar UI contains empty class names and hardcoded color utilities that conflict with the stated design-system requirement; Phase 1 must correct only the command-center surface.
- Existing repository tooling includes an in-memory mock database fallback; production-data acceptance checks must distinguish mock behavior from a real authorized database.
