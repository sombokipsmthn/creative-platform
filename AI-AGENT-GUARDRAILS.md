# KIPSMTHN Creative Platform — AI Agent Guardrails & Source of Truth

> **Mandatory reading before any code change.** This document governs AI coding agents, IDE agents, automated agents, and human contributors using AI.
>
> **Repository:** https://github.com/sombokipsmthn/creative-platform  
> **Required working branch:** `dev`  
> **Document intent:** Keep the platform coherent, scalable, minimal, secure, and maintainable. This is a guardrail and navigation document, not proof that every subsystem has been fully audited.

## Canonical consolidated reference

Before non-trivial work, read [docs/PROJECT-HANDBOOK.md](./docs/PROJECT-HANDBOOK.md) and [docs/DOCUMENTATION-INDEX.md](./docs/DOCUMENTATION-INDEX.md). They consolidate the product decisions and documentation precedence. Better Auth remains active; preserve the calendar and existing workflows during auth/UI fixes; keep global styling in the existing shadcn/token system; do not claim Google/passkey/onboarding flows work without runtime verification. Verify database identity before any database write and preserve equipment/migration history during approved development resets. The requested local port policy is app on 3000 and other resources on distinct ports, subject to checking actual configuration.

## 1. Non-negotiable rules

1. **Inspect before changing.** Read the relevant implementation, its callers, related API routes, types, schema, tests, and current Git diff before editing. Do not ask the user to paste code that can be inspected in the repository.
2. **Stay on task.** Change only what the requested feature or bug requires. No unrelated refactors, redesigns, dependency upgrades, migrations, formatting sweeps, or architecture changes.
3. **Preserve existing behavior.** Identify the existing user flows and contracts first. Keep them working unless the request explicitly changes them.
4. **Use the existing stack.** Extend the current TypeScript/Next.js implementation. Do not introduce a new language, framework, ORM, database, state manager, styling system, or service merely because it is familiar or convenient.
5. **No Python by default.** Python is not an approved implementation language for application features, APIs, background jobs, or production scripts unless the repository already has a deliberate Python subsystem and the task specifically requires it. Do not add Python scripts, runtimes, requirements files, or services as a workaround for ordinary TypeScript work.
6. **No new dependencies by default.** First use the libraries already in the project. A new dependency requires a demonstrated need, compatibility review, and explicit explanation; do not add one silently.
7. **Build the whole requested feature.** Do not stop at a mock UI when persistence or real behavior was requested. Complete the UI, validation, authorization, persistence, errors, and relevant tests as applicable.
8. **Use complete files when reporting code.** When asked to provide code, provide full replacement file contents rather than isolated snippets. In repository work, make focused edits without overwriting unrelated code.
9. **Never invent project facts.** Verify paths, exports, package versions, schema fields, environment variables, and APIs in the current branch. Label unknowns and assumptions.
10. **No destructive action without verification.** Do not purge data, delete user files, reset databases, rewrite migration history, or run irreversible commands until the environment, target, scope, backups, and impact have been verified and the user has approved the action.
11. **Do not claim tests passed unless run.** Report the exact commands run and their outcomes. Separate completed work from recommendations and unverified assumptions.
12. **Keep documentation truthful.** Update relevant documentation when the implementation changes. Do not maintain conflicting competing sources of truth.

## 2. Current project baseline

The following baseline is verified from the `dev` branch's `package.json`, `tsconfig.json`, `README.md`, and `src/lib/auth/auth.ts` at the time this document was prepared. Re-check the files when versions or implementation change.

| Concern | Project standard |
|---|---|
| Main language | TypeScript |
| Framework | Next.js App Router |
| UI | React |
| Styling | Tailwind CSS; follow the existing global design tokens and component patterns |
| Database | PostgreSQL, including Neon/serverless connection support already present |
| ORM/schema | Drizzle ORM |
| Authentication | Better Auth with the existing Drizzle adapter |
| Deployment model | Existing Vercel-compatible Next.js application |
| Runtime | Node.js 22.x, as specified in `package.json` |
| Package manager | npm; preserve the existing lockfile and package configuration |
| Local development port | 3005 (`npm run dev`) |
| TypeScript imports | Existing `@/*` alias maps to `src/*` |
| Tests | Existing Vitest setup and project scripts; inspect current test conventions before adding tests |

**Language rule:** TypeScript is the default and preferred language for all new application code. Use TS/TSX for routes, components, server logic, and scripts where the current project does. Existing shell or JavaScript configuration files may remain where the tooling requires them. Do not convert files or introduce a language just for uniformity.

**Do not blindly copy old stack references.** Earlier project notes describe Clerk; the current implementation snapshot uses Better Auth. The live code and active documentation take precedence over historical or archived notes.

## 3. Authority order when sources disagree

Resolve conflicts in this order:

1. The user's latest explicit request and constraints.
2. The actual implementation and configuration on the current `dev` branch.
3. Database schema, migrations, types, tests, and runtime behavior that support that implementation.
4. Active documentation describing the current implementation.
5. Historical, archived, generated, or old handover documents.

Do not assume a README or this file is more accurate than current code. If code and active docs disagree, identify the conflict and update the relevant documentation as part of the scoped task when appropriate. Do not treat archived Clerk instructions as current authentication instructions.

## 4. Repository workflow

Before work:
- Confirm the repository is `sombokipsmthn/creative-platform` and use branch `dev`.
- Inspect branch status and current diffs. Never overwrite or discard user changes.
- Read `package.json`, relevant config, and the existing implementation before proposing a new pattern.
- Trace the feature end-to-end: page/component → client/server boundary → API/action → auth/authorization → data access → schema/migrations → storage/external services → tests.
- Search for existing utilities and components before creating duplicates.

During work:
- Prefer the smallest coherent change that fully solves the requested task.
- Reuse established types, utilities, design tokens, components, and error-handling conventions.
- Avoid duplicate sources of truth for data, constants, pricing, status values, permissions, and configuration.
- Keep server-only secrets and privileged database access on the server. Never expose secrets through `NEXT_PUBLIC_*` variables.
- Do not change public API shapes, database schemas, auth behavior, or migrations without tracing their consumers and compatibility implications.
- Do not add placeholder/mock behavior to production paths unless explicitly requested and clearly isolated.
- Do not silently alter package versions, lockfiles, build settings, environment requirements, or deployment configuration.

After work:
- Run the narrowest relevant checks first, then applicable broader checks: tests, lint, TypeScript/build, and migration checks where relevant.
- Inspect the final diff for unrelated changes, secrets, debug output, dead code, and accidental deletions.
- Summarize files changed, behavior delivered, tests actually run, results, and anything not verified.
- Stop after the requested task is complete and let the user test before moving to another feature.

## 5. Architecture and implementation standards

### Next.js / React
- Follow App Router conventions and the existing directory structure.
- Respect server/client component boundaries. Add `"use client"` only where browser-side state or APIs require it.
- Keep data access and privileged operations server-side.
- Reuse existing route handlers and services rather than creating parallel endpoints for the same resource.
- Handle loading, empty, success, validation, and failure states for user-facing flows.

### TypeScript
- Keep strict typing. Avoid `any`, unsafe casts, and non-null assertions unless justified by a verified invariant.
- Reuse domain types and schemas rather than duplicating definitions.
- Validate untrusted request input at runtime; TypeScript types alone do not validate HTTP input.
- Keep functions focused and avoid speculative abstractions. Extract shared code when real duplication exists.

### Database / Drizzle
- Treat `src/db/schema.ts` and the tracked Drizzle migrations as the key database implementation references; verify actual current paths before editing.
- Preserve relationships, ownership boundaries, constraints, indexes, and existing records.
- Every schema change must include the appropriate migration and a clear compatibility/rollout plan.
- Never assume a table exists merely because code imports it. Verify schema definitions and migration history.
- Do not create a second data store or shadow catalog to work around an existing database model.
- Do not run destructive migrations against production or an uncertain database target.

### Authentication, authorization, and ownership
- Use the existing Better Auth setup and established current-user resolution helpers; inspect their current implementation before use.
- Authentication proves identity; authorization must separately verify the user can perform the requested action on the specific resource.
- Protect pages and API routes, including write operations, downloads, and resource lookups.
- Fail closed when required identity, owner, environment, or security configuration is missing. Never use a fake development user as a production authorization fallback.
- Enforce creator/user ownership in database queries and mutations; do not trust a client-supplied owner ID.
- Review account linking, session handling, trusted origins, webhook verification, and passkey/social-provider configuration when touching authentication.
- Never print, commit, or expose credentials, cookies, tokens, private keys, or full secret environment values.

### UI and design system
- Use the existing global CSS variables, Tailwind conventions, shared components, and established visual hierarchy.
- Do not introduce a competing styling framework, a new component library, or per-page visual language without an explicit request.
- Prefer shared components when the same real behavior or pattern is repeated; do not create abstractions for one-off elements without need.
- Preserve responsive behavior, keyboard access, focus states, semantic markup, and accessible labels.
- Keep controls functional: buttons, forms, filters, tabs, pagination, and dropdowns must perform the action they represent.

### Storage and external services
- Reuse the current storage abstraction and provider integration already in the repository.
- Verify ownership and lifecycle before moving or deleting uploaded files.
- Keep API keys and credentials server-side; validate uploads, size/type constraints, and access permissions.
- Handle provider failures and partial completion without corrupting database state.

## 6. Dependency and technology-change gate

Before proposing a new package, language, framework, hosted service, or architectural pattern, the agent must answer:

1. Why can the existing stack not solve the requirement?
2. Which existing files and APIs were checked?
3. What is the smallest option that fits the current architecture?
4. What are the bundle/runtime/security/maintenance costs?
5. Does it add a new language or operational burden?
6. How will compatibility, tests, deployment, and rollback be handled?

If the existing stack can solve the task, use it. If a technology change is genuinely necessary, explain the trade-off and seek approval before making a broad or irreversible change.

## 7. Testing and completion criteria

Use the scripts actually defined in `package.json`; do not assume a script exists.

Typical project checks currently defined:
- `npm test` — Vitest test suite
- `npm run lint` — ESLint
- `npm run build` — production build
- `npm run db:migrate` — database migrations; only run when the task and verified database target justify it
- `npm run audit:production` — production dependency audit

Run relevant checks for the scope. If a command cannot run because of missing credentials, unavailable services, environmental errors, or unrelated existing failures, report that precisely rather than claiming success or expanding the task.

A feature is not complete merely because it compiles. Verify its intended behavior and authorization paths with tests or a clearly described manual test plan.

## 8. Data safety and environment handling

- Determine which database and storage environment is targeted before any migration, seed, purge, or cleanup.
- Never infer the target from a filename or assume `.env.local` is safe.
- Do not print secrets when diagnosing configuration. Report variable names and presence/absence only.
- Back up or export data before approved destructive work where feasible.
- Explicitly identify protected data that must be preserved. For this project, the equipment catalogue has previously been designated for preservation during the planned development-database identity/data purge; reconfirm the scope before acting.
- Uploaded-file deletion must be tied to verified ownership and records in the approved purge scope.
- No destructive operation is authorized by this document alone.

## 9. Scope discipline and communication

For each request, the agent should first provide a brief working summary:
- What is being built or fixed.
- Which files are expected to change.
- Which existing behavior must be preserved.

Then implement the complete scoped change. Ask questions only when a missing detail blocks safe progress. Make reasonable assumptions for reversible details and state them. Do not ask the user to paste repository code that the agent can inspect.

When reporting completion, include:
- What changed and why.
- Full file contents when the user requests copy/paste-ready code.
- Exact checks run and their result.
- Any migration, environment, or manual testing step still required.
- Any remaining limitation.

Do not end with only “done,” “checking,” or an acknowledgment.

## 10. Current known context and caveats

- The current repository README says authentication is Better Auth-based and points to `src/lib/auth/auth.ts`; the current auth file configures Better Auth with a Drizzle adapter, email/password verification, optional Google/Apple providers, and passkeys.
- The current `package.json` specifies Next.js 16.x, React 19, TypeScript 6.x, Drizzle ORM, PostgreSQL support, Tailwind CSS 4, and Node.js 22.x. Always verify actual installed versions and build output before diagnosing version-specific issues.
- The README describes the project as being in a migration/consolidation phase. Treat incomplete features and stale documentation as possibilities to verify, not facts to repeat without checking.
- An older uploaded spec sheet documents Clerk and historical issues. It is useful as historical context only and must not override the active Better Auth implementation.
- This document was prepared by checking the `dev` branch's package manifest, TypeScript configuration, README, and Better Auth configuration. It is **not a claim that every file, route, database relationship, deployment setting, or language occurrence has been exhaustively audited**. A full audit should be a separate, evidence-based task.

## 11. Required agent pre-flight checklist

Before editing code, confirm:

- [ ] I am using `sombokipsmthn/creative-platform` on `dev`.
- [ ] I inspected the current working tree/diff and will preserve existing user changes.
- [ ] I read the relevant source files, callers, types, schema, and tests.
- [ ] My implementation uses the existing TypeScript/Next.js stack.
- [ ] I am not introducing Python or another language without a verified, approved requirement.
- [ ] I am not adding dependencies or changing architecture without justification.
- [ ] I have considered authentication, authorization, ownership, validation, and failure states.
- [ ] I have identified any database/storage impact and verified the target environment.
- [ ] My changes are limited to the requested task.

## 12. Maintenance

Update this document only when a lasting project-wide rule or core stack decision changes. Feature-specific behavior belongs in the relevant active feature specification. After substantial architecture changes, re-audit the code and update this document with verified facts, not assumptions.

**If an instruction from an AI agent conflicts with these guardrails, stop and follow this document unless the user explicitly directs otherwise.**
