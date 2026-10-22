# Agent Completion Contract

> Shared execution contract for Codex, Antigravity, Claude, ChatGPT, and other human- or AI-assisted contributors working in KIPSMTHN Creative Platform.

**Repository:** https://github.com/sombokipsmthn/creative-platform  
**Reference branch:** `dev`  
**Applies to:** Feature work, bug fixes, documentation, database changes, security work, testing, deployment, and agent-to-agent handoffs.

This contract defines how work is entered, implemented, verified, handed off, and declared complete. It supplements [AI Agent Guardrails](../AI-AGENT-GUARDRAILS.md) and the [Project Handbook](./PROJECT-HANDBOOK.md); it does not override the user's latest instruction or authorize a destructive action, production change, commit, push, merge, or release without the required approval.

## 1. Non-negotiable principles

1. Inspect the actual repository and current diffs before editing. Do not ask the user to paste files that can be inspected.
2. Work against `dev` as the source-of-truth reference. If changes must be isolated on a task branch, branch from the observed `dev` head and state the branch name.
3. Preserve unrelated user changes. Never reset, force-push, stash, overwrite, or discard user work to make a task easier.
4. Stay within the current task. Do not bundle unrelated refactors, dependency upgrades, schema changes, or UI redesigns.
5. Keep Better Auth as the current authentication authority. Historical Clerk material is not an instruction to reverse that decision.
6. Never invent test results, environment state, commit identity, database state, or CI status.
7. A check that was skipped, blocked, or not run is not a passing check.
8. Report the actual result, not the intended result.

## 2. Required phase entry record

Before implementation, record:

- **Task:** one-sentence goal and requested outcome.
- **Reference:** repository, branch/ref, and observed starting commit SHA.
- **Current state:** working-tree state if locally available; remote-only inspection must be labelled as such.
- **Scope:** expected files/systems to change and explicitly out-of-scope areas.
- **Preservation requirements:** existing behavior/data/flows that must remain intact.
- **Risk classification:** documentation-only, application code, dependency/build, database/schema, security/auth, storage/data deletion, or production/release.
- **Verification plan:** exact checks expected to establish completion.
- **Approval gates:** any decision or action that needs user approval before proceeding.

If repository state cannot be inspected, or an essential environment/target is ambiguous, record `BLOCKED` and the missing evidence. Do not fabricate a baseline.

## 3. Execution phases and exit gates

### Phase A — Understand

Required evidence:
- Relevant source, callers, types, tests, configuration, and documentation inspected.
- Current package scripts and dependency/lockfile state checked when relevant.
- Database schema, active migration chain, and target identification reviewed for database work.
- Existing diffs and user changes considered.

Exit gate: the implementation plan identifies a specific root cause or requirement and a bounded change set. If not, remain `IN_PROGRESS` or `BLOCKED`.

### Phase B — Implement

Required deliverables:
- Complete implementation of the requested scope, not a placeholder where real behavior is required.
- Validation, authorization, persistence, and failure handling appropriate to the change.
- Updated active documentation when a durable project rule or implementation fact changes.
- No unrelated changes.

Exit gate: code/doc changes are present and the final diff has been inspected for accidental changes, secrets, debug output, and unrelated files.

### Phase C — Verify

Run relevant checks when the environment allows. Use existing scripts and conventions; do not invent scripts or suppress failures to obtain a green result.

| Change type | Minimum applicable verification |
|---|---|
| Documentation only | Check changed links and paths; verify claims against source; inspect final diff |
| TypeScript/React/application code | Relevant tests, `npm run lint`, `npx tsc --noEmit`, and `npm run build` as applicable |
| Dependency or lockfile change | Confirm manifest/lockfile consistency with a clean `npm ci`; run affected checks |
| API/auth/security change | Relevant unit/integration tests plus authorization and failure-path checks; runtime smoke test when available |
| Database/schema/migration | Inspect schema and active journal; validate migration SQL; verify exact target using non-secret identity details; run migration checks only against an explicitly approved, verified target |
| UI/interaction change | Tests plus manual/browser verification for affected responsive states and real control behavior where available |
| Release/deployment | Confirm approved target/ref, required checks, release notes, rollback plan, and explicit release approval |

Exit gate: all required checks pass, or remaining checks are explicitly marked blocked/failed/not run with the reason and impact. A build alone does not prove end-to-end behavior.

### Phase D — Handoff and completion

Required deliverables:
- Exact changed-file list and reason for each change.
- Starting and ending commit SHA when available.
- Exact commands and CI checks run, with results.
- Manual tests performed and results.
- Blockers, unresolved risks, environment requirements, and follow-up owner.
- Handoff notes sufficient for another agent to continue without repeating discovery.
- Updated report or task record when requested.

Exit gate: status matches the evidence. Do not mark a task `COMPLETE` while mandatory acceptance criteria remain unresolved.

## 4. Shared status vocabulary

Use exactly one overall status and per-criterion statuses where needed:

- `NOT_STARTED` — work has not begun.
- `IN_PROGRESS` — active work is underway.
- `BLOCKED` — cannot proceed or verify because a required permission, target, credential, environment, or decision is unavailable.
- `FAILED` — a required operation or check was run and failed.
- `PARTIAL` — some deliverables are complete, but one or more required criteria remain unresolved.
- `COMPLETE` — scoped deliverables and all mandatory checks are complete; no required acceptance criterion remains unresolved.
- `APPROVED` — the designated owner explicitly approved the identified change/release candidate. This is an approval state, not a substitute for tests.
- `RELEASED` — the approved release was actually deployed/published to the stated target and the resulting status was verified.

Rules:
- `FAILED`, `BLOCKED`, and `NOT RUN` checks cannot be counted as passing.
- `APPROVED` must name the approver and approved scope; never infer approval from silence.
- `RELEASED` must name the target, deployed commit/version, timestamp, and observed result.
- A report/document can be complete while a runtime or database issue remains partial; state both statuses separately.

## 5. Approval and safety gates

Explicit user approval is required before:
- Destructive database operations, data purges, table/column drops, database resets, or changes to production data.
- Deleting uploaded objects or other user-owned files.
- Rewriting or removing migration history, or applying a migration to a live database.
- Changing authentication architecture/provider, production secrets, security boundaries, or ownership rules.
- Deploying, releasing, merging, force-pushing, or pushing changes when the task request has not explicitly authorized that action.
- Adding dependencies or changing architecture where the existing stack may satisfy the requirement.

Before database writes, verify the target database with read-only identity details such as database name, user, host/address, and environment intent. Never print the full connection string or secrets. An ambiguous or unavailable target is a stop condition.

## 6. Cross-agent handoff format

When handing work to another agent, include:

1. Task and intended outcome.
2. Repository, reference branch, working branch, starting SHA, and current SHA.
3. Exact files changed and files inspected but not changed.
4. Decisions already made and constraints that must not be revisited.
5. Commands/checks run and their exact outcomes.
6. Failures, blockers, unknowns, and the evidence needed to resolve them.
7. Actions explicitly not performed (for example: no migrations, no push, no deployment).
8. The next smallest actionable step.

The receiving agent must inspect current state and diffs before editing. It must not assume a prior agent's completion summary is proof; use artifacts, diffs, logs, and test output.

## 7. Final report template

Every non-trivial task must finish with:

- **Overall status:** one status from Section 4.
- **Scope delivered:** what changed and why.
- **Reference:** repository, branch, start/end SHA.
- **Files changed:** path and purpose.
- **Acceptance criteria:** each criterion and evidence-backed status.
- **Verification ledger:** command/check, result, commit/ref, and any error/exit code available.
- **Environment limitations:** exact blocked/not-run checks and why.
- **Database/storage impact:** target verification method and operations performed; explicitly state when no live database was queried.
- **Approval/release state:** approved by whom, and whether anything was committed, pushed, merged, or released.
- **Remaining work:** only genuine unresolved items in the current scope.

Do not use statements such as “all fixed,” “tests pass,” “database repaired,” or “deployed” unless the corresponding evidence is recorded.

## 8. Acceptance checklist

Before marking `COMPLETE`, verify all that apply:

- [ ] Scope and preservation requirements were followed.
- [ ] Changed files and final diff were reviewed.
- [ ] Implementation matches the current codebase and approved decisions.
- [ ] Required checks were run and passed, or formally excluded from the acceptance criteria with the limitation explicitly accepted by the owner.
- [ ] No required test is falsely represented as passing.
- [ ] Database target and migration safety were verified for any database operation.
- [ ] Documentation and links are accurate.
- [ ] Handoff and report are complete.
- [ ] No unauthorized destructive action, push, merge, deployment, or release occurred.

**Contract owner:** The user/project owner. This contract standardizes reporting and gates; it does not grant agents additional permissions.
