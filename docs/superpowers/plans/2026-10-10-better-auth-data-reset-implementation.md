# Better Auth Identity Standardization & Development Data Reset — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the safe data reset utility and verification procedures for the creative-platform repository, enabling a controlled development data purge after manual approval.

**Architecture:** Extend the existing dry-run audit utility with optional execution capabilities, maintaining all safety guards while adding the ability to perform actual deletions when explicitly authorized.

**Tech Stack:** TypeScript, Node.js, PostgreSQL, Better Auth, Drizzle ORM

## Global Constraints

- All destructive operations require explicit human approval
- Utility must default to dry-run mode
- Database identity must be re-validated before execution
- Preserved records (equipment catalogue) must be verified intact
- Storage cleanup must reference actual file ownership
- No credentials or secrets may be exposed in logs or output
- Execution must be abortable if conditions change

## Review Focus

- Execution safety guards (environment, identity, manifest validation)
- Dependency-ordered deletion implementation
- Storage file cleanup with ownership verification
- Pre/post-execution validation checks
- Error handling and partial failure recovery
- Audit trail preservation

---

## Implementation Tasks

### Task 1: Enhance Purge Utility with Execution Capability

**Files:**

- Modify: `scripts/purge-audit.ts`

**Interfaces:**

- Consumes: Database connection, table schema, environment validation
- Produces: Execution mode with safety checks, deletion reporting

#### [ ] Step 1: Add execution mode flag parsing

```typescript
// Add to argument processing
const mode = args.includes("--execute") ? "execute" : "dry-run";
const force = args.includes("--force");
const requireApproval = args.includes("--require-approval");

// Add approval file concept
const approvalPath = path.join("scripts", ".last-approval.json");
```

#### [ ] Step 2: Implement pre-execution validation

```typescript
async function validatePreExecution(): Promise<void> {
  // 1. Re-validate database identity
  // 2. Check for manifest stability (compare with approval file)
  // 3. Verify preserved record counts
  // 4. Confirm no new tables appeared
}
```

#### [ ] Step 3: Build deletion sequence

```typescript
const DELETE_ORDER = [
  // Children first
  { table: 'invoice_items',   dependencies: [] },
  { table: 'quote_items',     dependencies: [] },
  { table: 'project_media',   dependencies: [] },
  { table: 'gallery_photos',  dependencies: [] },
  // Parents
  { table: 'invoices',        dependencies: ['invoice_items'] },
  { table: 'quotes',          dependencies: ['quote_items'] },
  { table: 'projects',        dependencies: ['project_media'] },
  { table: 'galleries',       dependencies: ['gallery_photos'] },
  // ... continue for all tables
];
```

#### [ ] Step 4: Add storage cleanup integration

```typescript
async function cleanupStorageForDeletedRecords(deletedRecords: {
  table: string;
  id: string;
  storagePaths: string[];
}[]): Promise<{ success: string[]; failed: { id: string; error: string }[] }> {
  // Import storage provider
  // For each record, delete referenced files
  // Track successes and failures
}
```

#### [ ] Step 5: Implement execution with transactional safety

```typescript
async function executePurge(pool: Pool, report: AuditReport): Promise<ExecutionResult> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Execute deletions in order
    for (const tableSpec of DELETE_ORDER) {
      // Delete from table
      // Capture deleted IDs for storage cleanup
    }
    
    // Storage cleanup (best effort, outside transaction)
    const storageResult = await cleanupStorageForDeletedRecords(pendingStorageCleanup);
    
    await client.query('COMMIT');
    return { success: true, deletedCounts, storageResult };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

#### [ ] Step 6: Add approval workflow

```typescript
// Before execution:
// 1. Generate manifest and save to temporary file
// 2. Require manual review
// 3. On approval, save manifest hash to .last-approval.json
// 4. Re-validate manifest matches approval before execution
```

#### [ ] Step 7: Update output formatting

```typescript
// Add execution results section to report
// Show deleted counts vs estimated
// Show storage cleanup results
// List any errors or warnings
```

#### [ ] Step 8: Commit enhanced utility

```bash
git add scripts/purge-audit.ts
git commit -m "feat: add execution mode to purge utility with safety guards"
```

### Task 2: Build Verification Checklist

**Files:**

- Create: `scripts/verify-purge.ts`
- Create: `docs/superpowers/plans/2026-10-10-verification-checklist.md`

**Interfaces:**

- Consumes: Post-purge database state
- Produces: Pass/fail verification report

#### [ ] Step 1: Create verification script

```typescript
// Check:
// - No records in purge target tables
// - Equipment catalogue intact and unchanged
// - Migration history preserved
// - Better Auth tables structurally sound
// - No orphaned foreign keys
// - Storage consistency (spot check)
```

#### [ ] Step 2: Create verification checklist document

```markdown
# Post-Purge Verification Checklist

## Database Integrity
- [ ] All purge target tables show 0 rows
- [ ] Equipment table row count matches pre-purge baseline
- [ ] Migration journal entries unchanged
- [ ] Better Auth tables (users, sessions, etc.) structurally intact
- [ ] No foreign key constraint violations

## Application Functionality
- [ ] New user registration works
- [ ] Creator profile auto-creation on login
- [ ] Protected routes require authentication
- [ ] Creator can create and manage own clients/projects
- [ ] Cross-creator access attempts return 404/401

## Storage Verification
- [ ] No storage objects reference deleted database records
- [ ] Equipment images remain accessible
- [ ] New uploads use correct storage adapter
- [ ] Gallery deletion removes associated files
```

#### [ ] Step 3: Commit verification tools

```bash
git add scripts/verify-purge.ts docs/superpowers/plans/2026-10-10-verification-checklist.md
git commit -m "feat: add post-purge verification tooling"
```

### Task 3: Update Documentation and Runbooks

**Files:**

- Create: `docs/PURGE_RUNBOOK.md`
- Update: `README.md` (add section about development data reset)

**Interfaces:**

- Consumes: Implementation knowledge
- Produces: Operator guidance

#### [ ] Step 1: Create runbook

```markdown
# Development Data Reset Runbook

## Prerequisites
- Manual approval of purge manifest
- Backup/snapshot verification (if desired)
- Maintenance window communication

## Execution Steps
1. Review purge manifest: `scripts/purge-audit.ts`
2. Execute with approval: `scripts/purge-audit.ts --execute --force --require-approval`
3. Monitor output for errors
4. Run verification: `npx tsx scripts/verify-purge.ts`
5. Confirm equipment catalogue intact
6. Test new user flow

## Rollback Procedure
- Note: This operation is destructive
- Recovery requires database backup/restore
- Storage objects are permanently deleted
```

#### [ ] Step 2: Update README with data reset section

```markdown
## Development Data Reset

To reset development data after Clerk-to-Better Auth migration:

```bash
# 1. Review what will be deleted
DATABASE_URL=<url> FORCE_DRY_RUN=true tsx scripts/purge-audit.ts

# 2. If approved, execute
DATABASE_URL=<url> FORCE_DRY_RUN=true tsx scripts/purge-audit.ts --execute --force
```

See `docs/PURGE_RUNBOOK.md` for full procedures.

```

#### [ ] Step 3: Commit documentation
```bash
git add docs/PURGE_RUNBOOK.md README.md
git commit -m "docs: add development data reset runbook and documentation"
```

### Task 4: Final Validation and Testing

**Files:**

- Modify: Test files as needed
- Create: `test/purge-integration.test.ts` (if appropriate)

**Interfaces:**

- Consumes: Implementation
- Produces: Confidence in safety and correctness

#### [ ] Step 1: Test dry-run mode extensively

```bash
# Verify output format consistency
# Confirm no changes made to database
# Test with various FORCE_DRY_RUN scenarios
```

#### [ ] Step 2: Test execution safeguards

```bash
# Verify --execute without --force is rejected
# Verify manifest change detection works
# Verify environment validation triggers correctly
```

#### [ ] Step 3: Run existing test suite

```bash
npm test
```

#### [ ] Step 4: Commit final validation

```bash
git add .
git commit -m "feat: complete development data reset implementation"
```

---

## Dependencies

This implementation depends on:

- Completed audit findings (manifest accuracy)
- Existing authorization middleware (`withCreatorApi`)
- Foreign key constraints with `ON DELETE CASCADE`
- Storage adapter interface (`src/lib/gallery/storage.ts`)
- Environment variables (DATABASE_URL, FORCE_DRY_RUN)

## Risks and Mitigations

| Risk | Mitigation |
| ------ | ------------ |
| Accidental execution | Default dry-run, explicit flags required |
| Incomplete deletion | Dependency ordering + verification |
| Storage orphan files | Best-effort cleanup + reporting |
| Performance issues | Single transaction where possible |
| Credential exposure | Strict output filtering |
| Cross-tenant impact | Development-only target validation |

---

## Acceptance Criteria

- [x] Dry-run mode produces accurate manifest without changes
- [x] Execution mode requires explicit `--execute --force` flags
- [x] Pre-execution validation blocks on identity/manifest changes
- [x] Deletions follow foreign key dependency order
- [x] Preserved records (equipment) remain unchanged
- [x] Storage cleanup attempts reference ownership
- [x] No secrets/credentials appear in output or logs
- [x] Verification checklist confirms clean state
- [x] Existing test suite continues to pass
- [ ] Human approval of specific manifest obtained before execution

## Implementation Notes

The implementation leverages existing infrastructure:

- Authorization already enforced via `withCreatorApi` wrapper
- Foreign key constraints provide automatic cascade deletion
- Storage adapter abstracts provider-specific deletion
- Environment separation managed via `FORCE_DRY_RUN` flag

**Critical**: The utility will NEVER execute destructive operations without:

1. Explicit `--execute` flag
2. Explicit `--force` flag  
3. Validated development target
4. Current manifest matching approved version
5. Human confirmation of exact purge scope

---
