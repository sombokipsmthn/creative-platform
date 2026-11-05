# KIPSMTHN Creative Platform — Project Handbook

> **Canonical project reference.** Start here before making product, architecture, UX, database, authentication, or operations changes.
>
> Repository: https://github.com/sombokipsmthn/creative-platform/tree/dev  
> Working branch: `dev`  
> Last consolidated: 2026-10-22

## 1. How to use this handbook

This document records durable product decisions and points to specialist documents. It is not proof that every listed feature is complete. The repository implementation is the authority for what currently works; approved requirements are the authority for what should be built.

Every feature/status statement must be classified as:
- **Implemented/verified** — confirmed in current code or by a recorded test.
- **Partially implemented** — some of the flow exists, but end-to-end behavior is incomplete.
- **Requested/planned** — a user-approved requirement that has not been verified as implemented.
- **Blocked/unverified** — cannot be confirmed without a working environment, credentials, database access, or a test.

Do not infer completion from a plan, old audit, mock UI, a successful static build, or an unchecked checkbox.

## 2. Product direction

KIPSMTHN Creative Platform is a creative operating system for a media production studio. It combines:
- A public marketing and portfolio website.
- A creator workspace for clients, projects, galleries, quotes, invoices, contracts, calendar, expenses, equipment planning, profile, and settings.
- Private client delivery and proofing experiences.
- Shared business workflows that connect a client and project to the relevant quotes, invoices, contracts, schedule, and gallery.

The product should feel like a coherent creative OS, not a collection of unrelated admin pages. Dashboard information should flow from summary to trends to details, with useful status/delta indicators and clear next actions. Public marketing and authenticated creator workspace are separate experiences.

## 3. Technical baseline

- Framework: Next.js App Router, TypeScript, React.
- TypeScript: `package.json` range `^5.8.2`; `package-lock.json` resolves `node_modules/typescript` to `5.9.3`. This does not independently verify a local installed version.
- Styling: Tailwind CSS and the existing shadcn/ui conventions.
- Global design tokens: `src/app/globals.css`.
- Shared UI primitives: `src/components/ui/`.
- Database access: Drizzle ORM with PostgreSQL/Neon.
- Authentication: Better Auth with the Drizzle adapter.
- Database schema: `src/db/schema.ts`; migration history under `drizzle/`.
- Hosting/deployment target: Vercel-compatible Next.js deployment.
- Package manager: npm; preserve the existing lockfile and package conventions.

Always verify exact versions and file paths from the current `dev` branch before documenting them. Do not reintroduce Clerk as the active authentication provider. Historical Clerk references may remain in clearly labelled migration/audit records only.

## 4. Authentication and onboarding decisions

Better Auth remains the selected authentication system. Do not migrate back to Clerk.

The intended experience is one continuous identity journey, not disconnected sign-in, passkey, and onboarding features:
1. A user chooses an available sign-in/sign-up method.
2. Better Auth handles the relevant authentication and account/session lifecycle.
3. Google OAuth and passkey sign-in are supported where their provider/plugin configuration is actually present and configured.
4. The app resolves the Better Auth identity to the local creator/user record.
5. New creators complete onboarding; returning creators continue to their workspace.
6. Onboarding must be skippable where specified, with unfinished profile details editable later from the profile area.
7. Sign-out and session-expiry behavior must remain visible and functional.

Email/password, email verification, Google OAuth, passkeys, and any other provider must be marked individually as verified or unverified from code and runtime tests. Never document a provider as working merely because a configuration placeholder exists. Demo login must use the intended demo database and seeded account, not guessed credentials or production data.

Canonical code to inspect first: `src/lib/auth/auth.ts`, `src/lib/auth-client.ts`, `src/lib/auth/get-current-user.ts`, `src/lib/auth.ts`, `src/proxy.ts`, `src/db/schema.ts`, and the relevant auth/onboarding routes. Reconfirm these paths in the branch before editing.

## 5. Database, environments, and destructive changes

- Drizzle schema and migrations are the source of truth for application structure.
- Never assume `DATABASE_URL` and `DEMO_DATABASE_URL` point to the same database, or that a familiar Neon hostname means a database is safe to purge.
- Before any database write, migration, seed, or destructive operation, verify the actual target using non-secret database identity details (database name, user, host/address and environment intent). Never print credentials or full connection strings.
- Demo/test data must use the dedicated demo/development target. A failed connection or ambiguous target is a stop condition, not permission to fall back to another URL.
- Development reset work must not touch production.
- Preserve the equipment catalogue and its imported records during creator-data resets unless the user explicitly changes that decision.
- Remove uploaded objects only when their ownership/reference to records being removed has been positively established. Do not bulk-delete a bucket or infer object ownership from filenames.
- Preserve valid Drizzle migration history. Do not edit applied migrations to repair a live schema; create a forward migration where required.
- A schema/table error (for example, a missing `gallery_themes` relation) should be fixed at the actual schema/migration/database-target layer, not hidden by weakening the API or adding mock fallback behavior.
- Prefer fixes over repeated audits when the user asks to fix a known issue. Keep any necessary verification focused on the fix.

## 6. Creator data and demo workspace

Creator-owned records must be scoped to the authenticated local creator identity and protected by ownership checks. This includes client, project/media, gallery, quote, invoice, contract, calendar, expense, and settings data where applicable.

The demo account seed is expected to use `DEMO_DATABASE_URL` and the documented demo environment variables. Keep sample quotes, invoices, and contracts clearly labelled as samples. Never represent demo records as real offers or payment requests. Preserve shared equipment catalogue data. See [Demo account guide](./demo-account.md) and inspect the seed script before changing its behavior.

## 7. UI and interaction requirements

### Shared visual system
- Use the existing shadcn/ui primitives and semantic theme variables.
- Global tokens and shared styling belong in `src/app/globals.css` and existing shared primitives, not scattered page-specific CSS.
- Keep typography consistent across headings, body text, labels, metadata, and controls. Do not introduce monospace typography into the product UI; use the approved product font/typography system.
- Use consistent spacing, radii, borders, shadows, icon sizing, button variants, form states, and responsive behavior.
- Maintain accessible contrast and both light and dark themes.
- Do not reintroduce purple/violet literals, obsolete Hausly/Hously branding, duplicate global stylesheets, or case-only duplicate UI primitives.
- Use colorful icons where appropriate without making the interface visually noisy.

### Navigation and workspace
- Public marketing homepage remains distinct from the signed-in creator dashboard.
- The creator workspace keeps clear Dashboard, Admin/workspace, Gallery, and Projects navigation.
- Gallery tools should use top-level tabs when consistent with the existing Platform Settings pattern rather than deeply nested side navigation.
- Keep profile/avatar and sign-out controls easy to find; do not remove sign-out while changing navigation.
- Equipment should remain available to quote/production workflows but hidden from the primary navigation/dashboard when that is the established product decision.
- Onboarding should be skippable where requested, and users should be able to complete details later from profile.

### Admin screens
- Standardize permission/admin page headers through reusable components where practical, with page-specific actions supplied as props.
- Shared Search, Status, and Category filters plus New/Create actions should be styling-only when that is the stated task: preserve existing handlers, filtering, data flow, and business logic.
- Preserve working calendar functionality and its existing behavior during auth and UI work.
- Preserve all existing functionality when styling or fixing a single screen. Do not turn a visual-only task into a redesign or data-flow change.

## 8. Gallery and media direction

Client galleries should support private access and a clear delivery/proofing workflow. Relevant capabilities include collections, uploads, ordering, publishing, access controls, favorites/selections, comments, views/activity, approvals, downloads, and watermarks as implemented or explicitly planned. Track each capability honestly; a UI placeholder or simulated action is not a completed persistence workflow.

Storage is behind the existing application abstraction where present. Preserve original assets and generated display/preview/thumbnail variants according to the active implementation. Do not invent storage URLs or claim that local development and production use the same provider. Verify the current adapter and environment configuration before changing uploads or deletes.

## 9. Business workflows and domain rules

- Multiple projects may belong to one client; project-specific quotes, invoices, contracts, payments, calendar events, and galleries should retain correct associations.
- Default quote currency is intended to be KES unless a specific persisted record or configured preference says otherwise.
- Quote deposit defaults to 50% unless the record/business settings specify otherwise.
- Keep Kenyan business needs in scope where implemented: KRA PIN details, VAT/WHT handling, eTIMS-related invoice state, and local currency formatting.
- Equipment remains a shared catalogue and should not be accidentally removed by creator-data cleanup.
- Never fake persistence or label a simulation as a working integration.

## 10. Development and port policy

The requested local development convention is for the main Next.js app to use port **3000** by default. Any other local service/resource must use a separate, documented port and must not silently occupy the app's port. Before claiming this is implemented, verify `package.json`, scripts, Docker configuration, and any local service configuration. Do not kill unrelated processes blindly; identify the process and confirm its role before stopping it.

Common validation commands (verify package scripts before relying on names):
- `npm run lint`
- `npx tsc --noEmit`
- `npm test`
- `npm run build`
- `npm run design-system:check`

Run the narrowest relevant checks first, then broader checks when the environment supports them. Report exact commands and actual outcomes. Do not claim success without running them.

## 11. Security and SOC 2

Security is a continuing engineering requirement, not a claim of certification. Treat the SOC 2 documents as planning/evidence materials whose control status must be verified against current code, settings, operational evidence, and actual ownership. Do not claim SOC 2 compliance or audit completion solely because documentation exists.

Keep auth/session boundaries, creator ownership checks, input validation, rate limiting, secrets management, storage access, logging, backup/recovery, retention, incident response, and vendor risk aligned with the active implementation. Better Auth replaces Clerk in the current runtime model; security and compliance documents that name Clerk as active must be labelled historical or revised where they describe current controls.

## 12. Current focus and known open work

These items are requirements or investigation targets unless verified as completed in current code/tests:
- Stabilize Better Auth sign-in/sign-up, Google, passkey, sign-out, user resolution, demo login, and onboarding as one coherent journey.
- Resolve environment/database-target confusion and repair database/schema mismatch errors at the correct target.
- Preserve the calendar while repairing auth and dashboard regressions.
- Restore consistent typography, global styling, navigation, and dashboard hierarchy without unrelated rewrites.
- Fix the specific TSX/JSX syntax and build failures reported by the developer, using the current repository files and full-file context.
- Standardize admin headers and style shared Search/Status/Category filters and New/Create actions without changing their logic.
- Set and document the local port convention (Next.js app on 3000; other resources on distinct ports).
- Keep documentation consolidated and prevent outdated specs from directing agents toward superseded architecture.

For every item, update status only after inspecting the implementation and recording relevant validation. Do not convert user requests into claims of completion.

## 13. Agent workflow

Use the shared [Agent Completion Contract](./AGENT-COMPLETION-CONTRACT.md) for phase entry criteria, required deliverables, test gates, blocker handling, cross-agent handoffs, approval boundaries, and final reporting. This contract supplements the workflow below and does not authorize destructive database operations, production changes, or releases by itself.

Before implementation:
1. Read this handbook, [Documentation Index](./DOCUMENTATION-INDEX.md), [Agent Completion Contract](./AGENT-COMPLETION-CONTRACT.md), and the relevant specialist doc.
2. Inspect the current `dev` branch files, callers, schemas, tests, environment variable names, and current diffs. Do not ask the user to paste repository code that can be inspected.
3. Summarize the feature/bug in 3–5 bullets and name the files expected to change.
4. Stay strictly within the current task. Make reasonable assumptions; ask only questions that block safe progress.

During implementation:
- Complete the requested feature rather than stopping at a mock or partial UI.
- Preserve existing stack, routes, schemas, business rules, and working behavior.
- Provide full-file replacements when reporting code for manual copy/paste.
- No destructive database/storage action without target verification and explicit approval.
- No unrelated refactors, dependency changes, schema changes, or architecture redesign.

After implementation:
- Run relevant tests/checks where possible and state what was and was not verified.
- Update the changelog and the relevant authoritative docs for meaningful changes.
- Keep historical reports as history; do not rewrite them to imply their earlier claims were made today.
- Wait for the developer to test; on returned errors, fix the smallest relevant issue first.

## 14. Documentation precedence

If documents conflict, use this order:
1. Current source code, schema, migration history, tests, and active environment configuration (for current implementation facts).
2. This handbook for consolidated product decisions and current requirements.
3. `KIPSMTHN-SPEC.md` for product/functional scope.
4. `KIPSMTHN-IMPLEMENTATION-SPEC.md` for implementation details and status.
5. `README.md` and specialist docs for setup and operational instructions.
6. `CHANGELOG.md`, audit summaries, implementation plans, `docs/archive/`, and `docs/soc2/` evidence for historical context unless explicitly revalidated.

When a discrepancy is found, fix the relevant active document and add a short entry to the documentation changelog. Do not silently delete historical evidence.


## 15. Product modularization and subscription direction (2026-11-05)

> **Product direction / planned architecture.** This section records the intended modular product model. It does not claim that subscription billing, module entitlements, feature gating, or every listed capability is implemented. Validate current code before implementation and keep status classifications honest.

### Product model

KIPSMTHN Creative Platform is intended to operate as one connected creative-business platform with a shared **Core** and three independently valuable paid modules:

1. **Core** — the foundation of the platform.
2. **Creative Intelligence** — advanced creative presentation, gallery management, and client delivery.
3. **Operations** — planning, scheduling, coordination, and execution of client work.
4. **Financial Intelligence** — quotes, invoicing, payments, expenses, and financial management.

The modules are product and entitlement boundaries, not separate applications or disconnected databases. They must share the same creator identity, client records, project records, files/references, and workflow context. A creator should experience one coherent workspace even when they subscribe to multiple modules.

### Core — shared platform foundation

Core is the baseline experience and should provide useful value without requiring a paid module. Intended scope:

- Creator account, identity, profile, and business/workspace settings.
- Command Centre/dashboard with core activity, reminders, and next actions.
- Shared client and project records at the foundational level.
- Basic public portfolio presence and publishing.
- Basic gallery creation, organisation, and sharing, sufficient for a creator to present and deliver work simply.
- Shared notifications, preferences, and account-level controls.

The Core dashboard must not depend on paid-module data being available. Paid-module metrics and actions should appear only when the relevant entitlement exists, with clear upgrade pathways where appropriate. Core must remain usable when all paid modules are inactive.

### Creative Intelligence — paid creative and delivery module

Creative Intelligence owns advanced portfolio, media, gallery, and client-delivery capabilities, including:

- Advanced gallery presentation, layout, themes, and customisation.
- Client proofing and review workflows.
- Comments, favourites, selections, and approval/change-request workflows.
- Controlled downloads, download presets, watermarks, expiry rules, and delivery permissions.
- Rich portfolio storytelling, case studies, and creative content curation.
- Gallery/portfolio engagement and delivery analytics.
- Advanced media organisation and client-facing presentation.

**Boundary:** Core retains basic portfolio and gallery functionality. Creative Intelligence adds advanced creative presentation, proofing, selection, and controlled delivery. Do not make a creator's basic portfolio or basic gallery access disappear solely because a paid module is inactive.

### Operations — paid planning and execution module

Operations owns the non-financial work required to organise and deliver client engagements:

- Calendar, scheduling, availability, and booking coordination.
- Enquiry and client-work pipeline where applicable.
- Project planning, tasks, milestones, deadlines, and dependencies.
- Production planning, shoot schedules, call sheets, shot lists, locations, and crew coordination.
- Team/staff coordination and resource allocation.
- Equipment catalogue workflows, availability, assignment, and utilisation for production.
- Contract creation, templates, agreement lifecycle, and client obligations.

Operations is more than a calendar. It is the system for planning, assigning, coordinating, and completing the work.

#### Contract ownership

Contracts belong to **Operations** because they define the agreement and obligations governing the work. Operations owns:

- Contract templates and reusable clauses.
- Drafting, sending, review, signing, and lifecycle status.
- Links to the relevant client and project.
- Deliverables, milestones, deadlines, responsibilities, and non-financial obligations.
- Signed-document storage and access.
- Expiry, renewal, and relevant obligation reminders.

Contracts also connect to Financial Intelligence. Financial Intelligence may read the contract's agreed fees, deposit requirements, payment schedule, cancellation charges, and other monetary terms to support quotes, invoices, payment tracking, and financial reporting. It does not become the owner of the legal agreement lifecycle.

If Operations access expires, preserve appropriate historical/read-only access to executed contracts and their records. Do not hold signed agreements hostage behind an active subscription.

### Financial Intelligence — paid financial management module

Financial Intelligence owns the financial lifecycle and reporting for the creator's business:

- Quotes, proposals, quote items, and quote approval/acceptance.
- Invoices, credit/debit notes, and invoice lifecycle.
- Payment records, instalments, payment schedules, refunds, and reconciliation tracking.
- Expenses, purchases, receipts, and cost tracking.
- Revenue, cash-flow, profitability, forecasting, and financial analytics.
- Financial documents, reports, and accountant exports.
- Currency handling and jurisdiction-aware tax configuration/adaptation.

Equipment, personnel, and production costs may originate in Operations or shared records and feed into quote costing and expense workflows. Financial Intelligence owns the monetary records and calculations; it should not duplicate operational resources.

Tax adaptation must be based on the creator/business's registration and actual tax obligations, not inferred from IP address, nationality, or a client's location. Kenya-specific needs may include KRA PIN details, configurable VAT/tax classifications, withholding-tax records, eTIMS reference/status tracking, KES reporting, tax-readiness indicators, and accountant-oriented exports. Do not claim direct KRA/eTIMS integration or certification unless a separately verified, authorised integration exists. Keep the underlying financial engine suitable for other jurisdictions.

### Shared records and cross-module workflows

Clients and projects are shared foundation records, not copied into each module. Modules attach their own capabilities and records to those shared entities through stable relationships and ownership checks.

Intended connected workflow:

1. A visitor makes an enquiry through the public/Core experience.
2. The creator creates or updates a shared client and project record.
3. Operations plans the work, schedules resources, and prepares the contract.
4. Financial Intelligence prepares the quote and records accepted financial terms.
5. Operations manages contract execution, milestones, schedule, and delivery obligations.
6. Financial Intelligence issues invoices and tracks payments, expenses, and financial status.
7. Creative Intelligence manages advanced gallery presentation, proofing, selections, approvals, and final client delivery.
8. Core provides the shared overview and next actions, while each module owns its detailed workflow.

A module may reference another module's records only through explicit, permission-checked integration contracts. Avoid duplicated sources of truth, circular ownership, or hidden assumptions that all modules are subscribed.

### Subscription and entitlement principles

- Core is the baseline; Creative Intelligence, Operations, and Financial Intelligence are separately purchasable modules.
- Bundles or higher-tier plans may include multiple/all paid modules, without changing the underlying module boundaries.
- Entitlements must be enforced server-side for protected pages, APIs, mutations, and data access. Hiding navigation alone is not access control.
- Module checks should be explicit and composable; do not scatter hard-coded plan-name checks throughout the application.
- Shared Core functionality must not break when a paid module is absent, expired, or unavailable.
- If a subscription expires or is cancelled, preserve user-owned historical records. Provide an appropriate read-only, export, or limited-access mode rather than deleting or locking away business records.
- Clearly distinguish a feature being unavailable for lack of entitlement from a technical error or missing data.
- Subscription state and module access must be designed to support independent modules and bundles; the current feature-level entitlement implementation must be audited before being treated as sufficient.

### Architecture guardrails for modularization

- Treat these boundaries as the target product architecture, not a mandate to rewrite the current codebase immediately.
- First map existing routes, APIs, schema tables, services, components, background jobs, dashboard metrics, and integrations to the proposed module ownership.
- Identify cross-module dependencies and existing duplicate systems before moving or deleting anything. In particular, investigate the existing calendar/studio-event models and APIs before consolidating them.
- Keep shared identity, client, project, and file ownership in the Core/shared platform layer.
- Make dashboard widgets resilient to missing paid modules; Core dashboard rendering must not fail because Financial Intelligence or another module is not subscribed.
- Preserve current functionality and data during any future modularisation. Do not change schemas, migrations, routes, or entitlement behavior solely because this specification has been updated.
- Record each feature as implemented/verified, partially implemented, requested/planned, or blocked/unverified. The codebase and tests determine implementation status; this section determines intended product direction.

### Current decision status

The module names and responsibility boundaries in this section are the working product direction recorded on 2026-11-05. Detailed pricing, packaging tiers, exact feature limits, trial rules, billing provider, grandfathering rules, and final upgrade/downgrade UX remain to be specified. Do not invent these details during implementation.
