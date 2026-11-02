CREATE TABLE "creator_branding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
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
	CONSTRAINT "creator_branding_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "entitlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"feature_key" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"source" text DEFAULT 'subscription' NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "entitlements_user_feature_unique" UNIQUE("user_id","feature_key")
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
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
	CONSTRAINT "subscription_plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"plan_id" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"trial_ends_at" timestamp,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"canceled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX IF EXISTS "users_email_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "users_auth_user_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "users_email_verified_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "users_created_at_idx";--> statement-breakpoint
ALTER TABLE "gallery_themes" ALTER COLUMN "layout" SET DEFAULT 'small_columns';--> statement-breakpoint
ALTER TABLE "gallery_themes" ALTER COLUMN "cover_style" SET DEFAULT 'full_image';--> statement-breakpoint
ALTER TABLE "gallery_themes" ALTER COLUMN "grid_spacing" SET DEFAULT 'regular';--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN IF NOT EXISTS "image_url" text;--> statement-breakpoint
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "image_layout" text DEFAULT 'small_columns' NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "image_orientation" text DEFAULT 'balanced' NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "image_sizing" text DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "gallery_width" text DEFAULT 'focused' NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "cover_composition" text DEFAULT 'full_image' NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "cover_image_id" uuid;--> statement-breakpoint
ALTER TABLE "creator_branding" ADD CONSTRAINT "creator_branding_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "entitlements_user_feature_idx" ON "entitlements" USING btree ("user_id","feature_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscriptions_user_status_idx" ON "subscriptions" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_auth_user_id_idx" ON "users" USING btree ("auth_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_email_verified_idx" ON "users" USING btree ("email_verified");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_created_at_idx" ON "users" USING btree ("created_at");