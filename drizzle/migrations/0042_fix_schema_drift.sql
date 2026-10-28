-- Fix schema drift: Add missing columns to gallery_watermarks and create missing tables

-- 1. Add missing columns to gallery_watermarks
ALTER TABLE "gallery_watermarks"
ADD COLUMN IF NOT EXISTS "type" text DEFAULT 'text' NOT NULL,
ADD COLUMN IF NOT EXISTS "image_url" text,
ADD COLUMN IF NOT EXISTS "image_path" text,
ADD COLUMN IF NOT EXISTS "image_filename" text,
ADD COLUMN IF NOT EXISTS "image_mime_type" text;

-- 2. Create gallery_watermark_presets table
CREATE TABLE IF NOT EXISTS "gallery_watermark_presets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" text NOT NULL,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"type" text DEFAULT 'text' NOT NULL,
	"text" text DEFAULT 'KIPSMTHN' NOT NULL,
	"position" text DEFAULT 'bottom-right' NOT NULL,
	"opacity" integer DEFAULT 55 NOT NULL,
	"font_size" integer DEFAULT 42 NOT NULL,
	"image_url" text,
	"image_path" text,
	"image_filename" text,
	"image_mime_type" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_watermark_presets_creator_name_key" UNIQUE("creator_id","name")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gallery_watermark_presets_creator_idx" ON "gallery_watermark_presets" USING btree ("creator_id");
--> statement-breakpoint
ALTER TABLE "gallery_watermark_presets" ADD CONSTRAINT "gallery_watermark_presets_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- 3. Create creator_workspace_branding table
CREATE TABLE IF NOT EXISTS "creator_workspace_branding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL UNIQUE,
	"custom_domain" text,
	"hide_platform_branding" boolean DEFAULT true NOT NULL,
	"header_logo_url" text,
	"favicon_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creator_workspace_branding" ADD CONSTRAINT "creator_workspace_branding_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- 4. Create creator_gallery_defaults table
CREATE TABLE IF NOT EXISTS "creator_gallery_defaults" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL UNIQUE,
	"default_photo_selection_limit" integer DEFAULT 25 NOT NULL,
	"default_expiration_days" integer DEFAULT 60 NOT NULL,
	"default_master_pin" text DEFAULT '4821' NOT NULL,
	"default_allow_downloads" boolean DEFAULT true NOT NULL,
	"default_allow_favorites" boolean DEFAULT true NOT NULL,
	"default_allow_selections" boolean DEFAULT true NOT NULL,
	"default_require_pin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creator_gallery_defaults" ADD CONSTRAINT "creator_gallery_defaults_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- 5. Create creator_email_templates table
CREATE TABLE IF NOT EXISTS "creator_email_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL UNIQUE,
	"invitation_subject" text DEFAULT 'Your Private Client Gallery is Ready — KIPSMTHN' NOT NULL,
	"invitation_body" text DEFAULT 'Hello {ClientName},\n\nYour private gallery "{GalleryTitle}" is now live on KIPSMTHN.\n\nUse your access PIN: {PIN} to view, favorite, and download your deliverables.\n\nBest regards,\n{CreatorName}' NOT NULL,
	"reminder_subject" text DEFAULT 'Reminder: Your gallery "{GalleryTitle}" expires in {DaysRemaining} days' NOT NULL,
	"reminder_body" text DEFAULT 'Hello {ClientName},\n\nThis is a friendly reminder that your access to "{GalleryTitle}" will expire on {ExpiryDate}.\n\nVisit the gallery to make your final selections and downloads.\n\nBest regards,\n{CreatorName}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creator_email_templates" ADD CONSTRAINT "creator_email_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;