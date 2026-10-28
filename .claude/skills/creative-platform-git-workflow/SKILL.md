---
name: creative-platform-git-workflow
description: Use before and during Creative Platform feature work, branch changes, multi-agent coordination, commits, or integration.
---

# Creative Platform Git Workflow

Canonical repository: https://github.com/sombokipsmthn/creative-platform

The shared development branch is dev. Perform feature work on a dedicated feature branch.

Before changes:
- Inspect the current branch, working tree, remotes, recent commits, and local commits absent from origin/dev.
- Preserve uncommitted changes and local commits.
- Never run destructive reset or clean commands to make the repository appear tidy.
- Never silently discard, overwrite, or stage unrelated user work.
- Stop if a branch or integration decision could lose existing work.

During multi-agent work:
- Assign exclusive file ownership where possible.
- Coordinate shared component interfaces before parallel implementation.
- Prevent agents from overwriting one another's changes.
- Review all integrated diffs and test the combined result.

Never commit directly to dev, force-push, merge, or deploy unless explicitly authorized. Do not change unrelated files.

Before committing:
- Review git status and git diff.
- Stage only files belonging to the intended task.
- Do not amend or rewrite existing commits without authorization.

At completion, report the branch, relevant base commit, changed files, test results, and working-tree status. Leave changes on the feature branch for review.
