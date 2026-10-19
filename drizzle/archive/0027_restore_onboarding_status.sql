ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "onboarding_status" text DEFAULT 'incomplete' NOT NULL;

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "onboarding_step" integer DEFAULT 1 NOT NULL;

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "email_verified" boolean DEFAULT false NOT NULL;

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "image" text;