-- Complete Better Auth session/account/verification/passkey indexes and passkey storage.
-- This migration is additive: it never drops or recreates platform tables or records.
CREATE TABLE IF NOT EXISTS "passkeys" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text,
  "public_key" text NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "credential_id" text NOT NULL UNIQUE,
  "counter" integer NOT NULL,
  "device_type" text NOT NULL,
  "backed_up" boolean NOT NULL,
  "transports" text,
  "aaguid" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "sessions_token_idx" ON "sessions" ("token");
CREATE INDEX IF NOT EXISTS "accounts_user_id_idx" ON "accounts" ("user_id");
CREATE INDEX IF NOT EXISTS "accounts_provider_id_idx" ON "accounts" ("provider_id");
CREATE INDEX IF NOT EXISTS "verifications_identifier_idx" ON "verifications" ("identifier");
CREATE INDEX IF NOT EXISTS "passkeys_user_id_idx" ON "passkeys" ("user_id");
CREATE INDEX IF NOT EXISTS "passkeys_credential_id_idx" ON "passkeys" ("credential_id");
