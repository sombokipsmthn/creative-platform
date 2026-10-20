# Documentation Index — KIPSMTHN Creative Platform

> Start here. Use the handbook and the two top-level specifications instead of reading every historical document for each task.
>
> Repository/branch: https://github.com/sombokipsmthn/creative-platform/tree/dev  
> Updated: 2026-10-21

## Read these first

1. [Project Handbook](./PROJECT-HANDBOOK.md) — **canonical consolidated reference** for product decisions, current architecture, security/data safeguards, UX requirements, agent workflow, and document precedence.
2. [KIPSMTHN Specification](../KIPSMTHN-SPEC.md) — product scope and functional requirements.
3. [Implementation Specification](../KIPSMTHN-IMPLEMENTATION-SPEC.md) — current technical implementation, status, and unresolved work.
4. [Root README](../README.md) — overview, local setup, validation, and deployment entry points.
5. [Agent Rules](../AGENTS.md) and [AI Agent Guardrails](../AI-AGENT-GUARDRAILS.md) — mandatory rules for repository changes.

## Specialist documents

| Area | Canonical document | Use it for |
|---|---|---|
| UI and styling | [Design System](./design-system.md) | shadcn/ui, semantic tokens, typography, component conventions |
| API | [API Reference](./api-reference.md) | Endpoint contracts; verify current route implementation before relying on examples |
| Demo account | [Demo Account Guide](./demo-account.md) | Dedicated demo database, seed data, account deletion safety |
| Studio dashboard | [Studio Command Center implementation](./studio-command-center-implementation.md) | Dashboard feature history and requirements; verify status against code |
| Database reset | [Better Auth data-reset audit](./superpowers/plans/2026-10-10-better-auth-data-reset-audit.md) and [implementation plan](./superpowers/plans/2026-10-10-better-auth-data-reset-implementation.md) | Historical review/plan only; never run destructive steps without current target verification and explicit approval |
| Deployment | [Docker Deployment](../DOCKER_DEPLOYMENT.md) and [GitHub Secrets Setup](../GITHUB_SECRETS_SETUP.md) | Deployment and CI secret setup |
| Security/compliance | [SOC 2 documentation index](./soc2/README.md) | Security policies, control plans, and evidence; not proof of certification |
| Current audits | [Audit reports](./audits/) | Findings and reports; check dates and current code before treating a finding as open |
| Change history | [Changelog](../CHANGELOG.md) and [Summary of Work](../SUMMARY_OF_WORK.md) | Historical records, not current runtime truth |

## Archive and generated evidence

- `docs/archive/` contains retained older guides, completion reports, and planning materials. Read for history only.
- `docs/soc2/` contains control plans and evidence. Preserve evidence integrity; update current controls only when they are revalidated.
- `docs/reports/` may contain large generated verification reports. These are evidence snapshots, not the primary implementation spec.
- `.agents/skills/` and `.claude/skills/` contain tool-specific skills and their reference material. Do not bulk-edit vendor/tool instructions merely to synchronize product documentation.
- `docs/superpowers/plans/` contains implementation plans; unchecked tasks do not prove implementation, and checked tasks should be revalidated against code when status matters.

## Documentation maintenance rules

- Start with the Project Handbook for every non-trivial change.
- Update only relevant active docs, but update every active document that would otherwise become contradictory.
- Never bulk rewrite security evidence, historical reports, vendored skills, or old audit findings just to make their wording look current.
- Mark claims as implemented, partial, requested, blocked, or unverified. Do not turn requests or plans into completion claims.
- Keep exact package versions, routes, environment variable names, schema details, and test results grounded in current files.
- Do not include secret values, database URLs, access tokens, passwords, or personal data in documentation.
- After a meaningful documentation change, update the `CHANGELOG.md` and check that all active entry-point links resolve.
