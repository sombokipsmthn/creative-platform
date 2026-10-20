# KIPSMTHN Creative Platform — Project Handbook

> **Canonical project reference.** Start here before making product, architecture, UX, database, authentication, or operations changes.
>
> Repository: https://github.com/sombokipsmthn/creative-platform/tree/dev  
> Working branch: `dev`  
> Last consolidated: 2026-10-21

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

Before implementation:
1. Read this handbook, [Documentation Index](./DOCUMENTATION-INDEX.md), and the relevant specialist doc.
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
