-- Repair subscription and custom-branding tables omitted from databases
-- where 0006_silly_hammerhead was recorded as applied without its DDL.
-- Safe to run against databases where some or all objects already exist.

CREATE TABLE IF NOT EXISTS "creator_branding" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
  "studio_name" text,
  "logo_url" text,
  "logo_path" text,
  "logo_light_url" text,
  "logo_light_path" text,
  "logo_dark_url" text,
  "logo_dark_path" text,
  "logo_transparent_url" text,
  "logo_transparent_path" text,
  "logo_svg_url" text,
  "logo_svg_path" text,
  "logo_size" text DEFAULT 'medium' NOT NULL,
  "brand_color" text DEFAULT '#000000' NOT NULL,
  "brand_color_light" text DEFAULT '#FFFFFF' NOT NULL,
  "cover_branding_visible" boolean DEFAULT true NOT NULL,
  "nav_branding_visible" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "creator_branding_user_id_unique" UNIQUE ("user_id")
);

CREATE TABLE IF NOT EXISTS "entitlements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
  "feature_key" text NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "source" text DEFAULT 'subscription' NOT NULL,
  "expires_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "entitlements_user_feature_unique" UNIQUE ("user_id", "feature_key")
);
CREATE INDEX IF NOT EXISTS "entitlements_user_feature_idx"
  ON "entitlements" USING btree ("user_id", "feature_key");

CREATE TABLE IF NOT EXISTS "subscription_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "price_amount" integer DEFAULT 0 NOT NULL,
  "currency" text DEFAULT 'KES' NOT NULL,
  "billing_interval" text DEFAULT 'monthly' NOT NULL,
  "features" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "subscription_plans_slug_unique" UNIQUE ("slug")
);

CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
  "plan_id" uuid NOT NULL REFERENCES "public"."subscription_plans"("id") ON DELETE CASCADE,
  "status" text DEFAULT 'active' NOT NULL,
  "trial_ends_at" timestamp,
  "current_period_start" timestamp,
  "current_period_end" timestamp,
  "canceled_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "subscriptions_user_status_idx"
  ON "subscriptions" USING btree ("user_id", "status");
