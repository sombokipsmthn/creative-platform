-- Reconcile onboarding tables with the current Drizzle schema without dropping legacy columns.
ALTER TABLE "creator_profiles"
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" TYPE uuid USING gen_random_uuid(),
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_unique" UNIQUE ("user_id");

CREATE TABLE IF NOT EXISTS "creator_business_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "business_name" text,
  "phone" text,
  "kra_pin" text,
  "vat_registered" boolean DEFAULT false NOT NULL,
  "vat_number" text,
  "currency" text DEFAULT 'KES' NOT NULL,
  "deposit_percentage" integer DEFAULT 50 NOT NULL,
  "wht_rate" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "creator_services" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "creator_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "description" text,
  "category" text,
  "default_rate" integer DEFAULT 0 NOT NULL,
  "currency" text DEFAULT 'KES' NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
