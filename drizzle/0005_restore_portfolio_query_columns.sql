-- Restore columns required by gallery portfolio curation.
-- Existing records and tables are preserved.

ALTER TABLE "public"."projects"
  ADD COLUMN IF NOT EXISTS "visibility" text NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS "published_at" timestamp;

ALTER TABLE "public"."galleries"
  ADD COLUMN IF NOT EXISTS "expires_at" timestamp,
  ADD COLUMN IF NOT EXISTS "expiry_behavior" text NOT NULL DEFAULT 'hide',
  ADD COLUMN IF NOT EXISTS "published_at" timestamp;

CREATE INDEX IF NOT EXISTS "projects_published_at_idx"
  ON "public"."projects" ("published_at");

CREATE INDEX IF NOT EXISTS "projects_visibility_idx"
  ON "public"."projects" ("visibility");
