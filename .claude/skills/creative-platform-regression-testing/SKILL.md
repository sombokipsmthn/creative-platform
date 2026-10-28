---
name: creative-platform-regression-testing
description: Use after changing Creative Platform UI, routes, forms, data displays, or workflows to check that existing functionality still works.
---

# Creative Platform Regression Testing

First inspect package.json, available test scripts, existing tests, and the affected code paths. Use the repository's existing tooling.

Verify relevant navigation, tabs, search, filters, pagination, forms, validation, loading states, error states, permissions, and responsive behavior.

When affected, explicitly protect these workflows:

- Dashboard metrics, merged calendar data, and onboarding eligibility.
- Gallery uploads, media selection, visibility, and publishing.
- Portfolio curation and public portfolio rendering.
- Quote calculations, KES defaults, 50% deposit behavior, equipment integration, and existing statuses.
- Invoice and payment calculations and records.
- Contract counts that exclude templates and follow existing business rules.
- Settings tabs, profile controls, authentication, and protected routes.

Run relevant targeted tests and available lint, type-check, and build commands. Never claim a check passed unless it actually ran successfully. Do not disable checks or change business logic merely to make tests pass.

Distinguish failures introduced by the current changes from pre-existing failures. Report checks performed, actual results, and remaining manual testing requirements.
