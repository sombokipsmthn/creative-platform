-- Better Auth creates users without the legacy auth_user_id field.
-- Keep this legacy account-linking field nullable, matching src/db/schema.ts.
ALTER TABLE "public"."users"
  ALTER COLUMN "auth_user_id" DROP NOT NULL;
