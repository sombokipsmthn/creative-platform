-- Reconcile the live projects table with the current Drizzle schema.
-- Additive and data-preserving: retain all existing project rows and columns.
ALTER TABLE "projects"
  ADD COLUMN IF NOT EXISTS "name" text;

DO $$
BEGIN
  -- Preserve legacy project titles when the live table uses an older column name.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'projects'
      AND column_name = 'title'
  ) THEN
    EXECUTE 'UPDATE "projects" SET "name" = "title" WHERE "name" IS NULL OR btrim("name") = ''''';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'projects'
      AND column_name = 'project_name'
  ) THEN
    EXECUTE 'UPDATE "projects" SET "name" = "project_name" WHERE "name" IS NULL OR btrim("name") = ''''';
  END IF;
END $$;

-- Older rows without a usable legacy title still receive a stable, non-empty label.
UPDATE "projects"
SET "name" = 'Project ' || "id"::text
WHERE "name" IS NULL OR btrim("name") = '';

ALTER TABLE "projects"
  ALTER COLUMN "name" SET NOT NULL;
