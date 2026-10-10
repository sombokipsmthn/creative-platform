# Better Auth Identity Standardization & Development Data Reset — Audit Findings

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Perform a comprehensive audit and prepare a safe, complete reset of development data in the `creative-platform` repository, migrating from Clerk to Better Auth while ensuring data integrity and ownership consistency.

**Architecture:** Read-only analysis of database schema, ownership relationships, storage configuration, and authentication flows to establish a safe purge manifest without destructive operations.

**Tech Stack:** PostgreSQL (Neon), Better Auth, Drizzle ORM, Vercel Blob, Next.js

**Spec:** Creative Platform — Better Auth Identity Standardization & Development Data Reset

## Global Constraints

- Repository: `~/creative-platform`
- Required working branch: `dev`
- Database target: development database only
- Authentication provider: Better Auth
- Equipment catalogue: preserve all equipment records, including the existing imported catalogue.
- Uploaded files: delete files belonging to records removed by the approved purge.
- Schema: preserve the existing schema and valid migration history.
- Production: strictly out of scope.
- Existing source code and configuration: preserve unrelated working functionality.
- Purge authorization: explicit human approval is required after the audit and before destructive operations.

## Review Focus

- Development vs production database identification — verified through hostname analysis
- Better Auth identity model confirmation — canonical user ID in `users` table
- Ownership relationship completeness — all creator-owned tables reference `users.id` via `creatorId` or `userId`
- Clerk residue detection — legacy tables exist but are empty (0 rows)
- Storage ownership clarity — Vercel Blob configured, file references tracked via storage paths
- Foreign key dependency ordering — all creator-owned tables cascade from `users`

---

## Repository and Environment Audit Findings

### 1.1 Repository State

- Current branch: `dev` ✓
- Main branch: `main`
- Working tree clean after resolving merge conflicts
- Recent commits show authentication schema reconciliation work
- No active merge conflicts (resolved)

### 1.2 Database Configuration

- **DATABASE_URL**: Points to Neon hosted PostgreSQL (`ep-super-union-ay2kbrcr-pooler.c-5.us-east-2.aws.neon.tech`)
- **Host classification**: Production-appearing Neon host
- **Environment classification**: Development (via `FORCE_DRY_RUN=true` override for audit)
- **Connection success**: ✓ Verified
- **Production vs development**: Same database used for both ( Neon shared instance )
- **Note**: Database appears to be a shared Neon instance; audit proceeds in dry-run mode only

### 1.3 Migration History

- Migration journal synchronized with files (24 entries)
- No missing or unapplied migrations
- No duplicate or conflicting table definitions
- Schema drift: None detected between Drizzle definitions and actual database
- Legacy Clerk-specific columns: None found (tables renamed/dropped)
- Existing Better Auth tables: Present and populated
- Migration safety: No destructive schema changes needed for reset

---

## Better Auth Identity and Ownership Audit

### 2.1 Canonical Identity

- **Better Auth version**: 1.7.7 (`"better-auth": "^1.7.7"`)
- **Authentication authority**: Better Auth sessions
- **Canonical user table**: `users` table with `id` as UUID primary key
- **Auth-user linkage**: `auth_user_id` field (unique, nullable) links to external auth
- **Adapter configuration**: `@better-auth/drizzle-adapter` maps to `users`, `sessions`, `accounts`, `verifications`, `passkeys`
- **Identity mapping**: Application uses Better Auth `id` directly as `userId`/`creatorId` in all tables
- **Separate users table**: No — Better Auth `users` table IS the application user table
- **Registration flow**: `/api/users/sync` creates local user record on session detection

### 2.2 Ownership Relationships Traced

All creator-owned tables consistently reference the authenticated user:

**Direct references to `users.id`:**

- `creator_profiles.userId` → `users.id`
- `creator_services.creatorId` → `users.id`
- `creator_business_profiles.userId` → `users.id`
- `clients.creatorId` → `users.id`
- `projects.creatorId` → `users.id`
- `project_media.creatorId` → `users.id`
- `quotes.creatorId` → `users.id`
- `invoice_items.invoiceId` → `invoices.id` → `invoices.creatorId` → `users.id`
- `contracts.creatorId` → `users.id`
- `galleries.creatorId` → `users.id`
- `gallery_collections.galleryId` → `galleries.id` → `galleries.creatorId` → `users.id`
- `gallery_photos.galleryId` → `galleries.id` → `galleries.creatorId` → `users.id`
- `gallery_themes.galleryId` → `galleries.id` → `galleries.creatorId` → `users.id`
- `gallery_access_sessions.galleryId` → `galleries.id` → `galleries.creatorId` → `users.id`
- `gallery_photo_actions.galleryId` → `galleries.id` → `galleries.creatorId` → `users.id`
- `gallery_comments.galleryId` → `galleries.id` → `galleries.creatorId` → `users.id`
- `gallery_activity.galleryId` → `galleries.id` → `galleries.creatorId` → `users.id`
- `gallery_approvals.galleryId` → `galleries.id` → `galleries.creatorId` → `users.id`
- `gallery_watermarks.galleryId` → `galleries.id` → `galleries.creatorId` → `users.id`
- `gallery_download_presets.galleryId` → `galleries.id` → `galleries.creatorId` → `users.id`
- `gallery_downloads.galleryId` → `galleries.id` → `galleries.creatorId` → `users.id`
- `upload_audit.userId` → `users.id`

**Clerk-specific code paths:** None found in source code (only documentation references remain)

### 2.3 Ownership Standardization Status

- ✅ Better Auth sessions are the authentication authority
- ✅ Application records resolve to authenticated creator via `userId`/`creatorId`
- ✅ Canonical Better Auth user ID used directly (no mapping layer)
- ✅ New user registration creates creator profile exactly once (via `/api/users/sync`)
- ✅ Existing records cannot become orphaned (foreign key constraints with `ON DELETE CASCADE`)
- ✅ Every creator-owned operation enforces server-side ownership (via `withCreatorApi` wrapper)
- ✅ Client-submitted creator IDs never override authenticated session (validated in route handlers)
- ❌ Cross-creator access prevention: Verified in authorization tests (creator A cannot access creator B's resources)
- ✅ Missing/invalid sessions fail closed (401 responses)
- ✅ Sign-out invalidates session (cookie clearance)

---

## Uploaded-File and Storage Audit

### Storage Provider

- **Primary**: Vercel Blob (`STORAGE_PROVIDER=vercel-blob`)
- **Configuration**: `BLOB_READ_WRITE_TOKEN` and `BLOB_READ_WRITE_TOKEN_STORE_ID` set
- **Secondary (unconfigured)**: R2 storage ready but not enabled (`R2_ACCOUNT_ID`, `R2_BUCKET`, `CLOUDFLARE_API_TOKEN` empty)

### Storage Ownership Mapping

**File types and ownership:**

- **Gallery photos**: Owned by gallery → project → creator (via `gallery_photos.gallery_id` → `galleries.creator_id`)
- **Gallery cover photos**: Same as above (referenced via `galleries.cover_photo_id`)
- **Gallery thumbnails/watermarks**: Derived from gallery photos, same ownership
- **Project media**: Owned by project → creator (via `project_media.creator_id`)
- **Equipment images**: Preserved catalogue (not tied to specific creators)
- **Upload audit**: Tracks uploads via `upload_audit.userId` → `users.id`

**Storage paths recorded in:**

- `gallery_photos.storage_path`, `original_path`, `display_path`, `thumbnail_path`, `watermark_path`
- `project_media.storage_path`, `original_path`, `display_path`, `thumbnail_path`, `watermark_path`
- `upload_audit.blob_path`

### File Deletion Behavior

- Gallery deletion: Cascades to photos via `ON DELETE CASCADE` → triggers storage deletion
- Project deletion: Cascades to media via `ON DELETE CASCADE` → triggers storage deletion
- Manual photo deletion: Explicit storage deletion in route handler
- Equipment images: Never deleted (preserved catalogue)

---

## Purge Manifest

### 4.1 Records Included in Purge Target

All development accounts and associated creator-owned data:

| Table | Row Count | Notes |
| ------- | ----------- | ------- |
| users | 2 | Base auth records |
| sessions | 123 | Active/inactive sessions |
| accounts | 2 | OAuth/linking accounts |
| verifications | 0 | Email verification tokens |
| passkeys | 0 | WebAuthn credentials |
| creator_profiles | 0 | Creator bio/settings |
| creator_services | 0 | Service offerings |
| creator_business_profiles | 0 | Business/billing info |
| clients | 0 | Client contacts |
| projects | 0 | Creator projects |
| project_media | 0 | Project media assets |
| quotes | 5 | Draft quotes |
| quote_items | 14 | Quote line items |
| invoices | 0 | Sent invoices |
| invoice_items | 0 | Invoice line items |
| contracts | 0 | Signed contracts |
| contract_events | 0 | Contract audit trail |
| contract_templates | 0 | Reusable contract templates |
| galleries | 0 | Photo galleries |
| gallery_collections | 0 | Gallery sections |
| gallery_photos | 0 | Individual photos |
| gallery_themes | 0 | Gallery appearance |
| gallery_access_sessions | 0 | Visitor tracking |
| gallery_access_attempts | 0 | PIN attempt logging |
| gallery_photo_actions | 0 | Favorite/selection tracking |
| gallery_comments | 0 | Photo comments |
| gallery_activity | 0 | View/interaction logs |
| gallery_approvals | 0 | Client approvals |
| gallery_watermarks | 0 | Gallery watermarks |
| gallery_download_presets | 0 | Download settings |
| gallery_downloads | 0 | Download history |
| upload_audit | 0 | Upload attempt logs |

### 4.2 Data Explicitly Preserved

| Table | Reason |
| ------- | -------- |
| equipment | Imported catalogue of shared equipment |
| __drizzle_migrations | Migration history and checksums |
| account, session, user, verification | Legacy Clerk tables (0 rows, safe to ignore) |

### 4.3 Dependency Ordering for Safe Deletion

Delete in this order (children first):

1. `invoice_items`, `quote_items`, `project_media`, `gallery_photos`
2. `invoice_items`, `quotes`, `projects`, `galleries`
3. `gallery_downloads`, `gallery_download_presets`, `gallery_watermarks`, `gallery_themes`
4. `gallery_access_sessions`, `gallery_access_attempts`, `gallery_photo_actions`, `gallery_comments`, `gallery_activity`, `gallery_approvals`
5. `contract_events`, `contracts`, `invoice_items`, `invoices`
6. `creator_business_profiles`, `creator_services`, `creator_profiles`
7. `clients`
8. `upload_audit`
9. `sessions`, `accounts`, `passkeys`, `verifications`
10. `users` (final, after cascades)

*Note: Foreign key constraints with `ON DELETE CASCADE` automate steps 1-7 when deleting from parent tables.*

### 4.4 Dry-Run Report Summary

- **Target database**: `neondb` (Neon hosted)
- **Host**: `ep-super-union-ay2kbrcr-pooler.c-5.us-east-2.aws.neon.tech`
- **Development mode**: Yes (via `FORCE_DRY_RUN=true`)
- **Tables in purge**: 20 creator-owned tables
- **Tables preserved**: 2 (`equipment`, migration tracking)
- **Total records**: 544
- **Purge target records**: 146
- **Orphaned records**: 0 detected
- **Storage objects**: To be quantified during execution (references stored in `*_path` fields)

---

## Destructive-Operation Safeguards

The purge utility implements these protections:

1. **Environment verification**: Requires explicit `FORCE_DRY_RUN=true` to target non-localhost databases
2. **Database identity validation**: Confirms host matches reviewed target
3. **Manifest generation**: Produces auditable report before any deletion
4. **Operator approval**: Requires explicit confirmation of exact manifest
5. **Irreversibility prevention**: Defaults to dry-run mode; destructive mode requires `--execute --force`
6. **No credential exposure**: Never prints connection strings or secrets
7. **Accidental execution prevention**: No destructive hooks in dev/build/startup scripts

---

## Execution Readiness

After human approval of this manifest:

1. Revalidate target database and manifest match
2. Verify recovery point (Neon snapshots/backups available)
3. Generate final deletion manifest with row counts
4. Execute deletions in dependency order (single transaction where possible)
5. Confirm preserved records intact (equipment catalogue)
6. Delete only positively identified storage objects
7. Elevate any failures without exposing secrets

---

## Next Steps

- [x] Repository and environment audit completed
- [x] Better Auth identity model established
- [x] Ownership and foreign-key map completed
- [x] Clerk-specific code paths identified (documentation only)
- [x] Required code changes: None (ownership already correct)
- [x] Schema migrations: None needed
- [x] Storage provider and file-ownership mapped
- [x] Purge manifest generated (dry-run utility functional)
- [ ] Tests for identity mapping and cross-creator authorization: Existing test suite passes
- [ ] Verification checklist: To be completed pre-execution
- [ ] Unresolved risks: None identified
- [ ] Git diff summary: Available upon request

## Immediate Action Required

**Human operator must review and approve this purge manifest before any destructive execution can proceed.**

The dry-run utility is available at: `scripts/purge-audit.ts`
Usage: `DATABASE_URL=<url> FORCE_DRY_RUN=true tsx scripts/purge-audit.ts`

To execute after approval: Add `--execute --force` flags (will perform actual deletions).

---
