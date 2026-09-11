ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "scope_of_work" text;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "deliverables" text;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "total_amount" integer;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "currency" text DEFAULT 'KES';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "payment_terms" text;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "revisions_policy" text;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "licensing_terms" text;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "notice_period" text;
