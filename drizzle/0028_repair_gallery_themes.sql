-- Repair environments where the gallery-theme table is missing despite
-- the original gallery-theme migration being recorded as applied.
-- Idempotent: preserves existing table data and only adds missing columns.

CREATE TABLE IF NOT EXISTS "gallery_themes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "gallery_id" uuid NOT NULL,
  "name" text DEFAULT 'Default' NOT NULL,
  "type" text DEFAULT 'preset' NOT NULL,
  "layout" text DEFAULT 'masonry' NOT NULL,
  "accent_color" text DEFAULT '#000000' NOT NULL,
  "background_color" text DEFAULT '#ffffff' NOT NULL,
  "text_color" text DEFAULT '#000000' NOT NULL,
  "border_radius" integer DEFAULT 0 NOT NULL,
  "show_title" boolean DEFAULT true NOT NULL,
  "show_description" boolean DEFAULT true NOT NULL,
  "show_collections" boolean DEFAULT true NOT NULL,
  "show_logo" boolean DEFAULT true NOT NULL,
  "masonry_columns" integer DEFAULT 4 NOT NULL,
  "aspect_ratio" text DEFAULT 'auto' NOT NULL,
  "font_family" text DEFAULT 'sans' NOT NULL,
  "cover_style" text DEFAULT 'image' NOT NULL,
  "cover_focal_x" integer DEFAULT 50 NOT NULL,
  "cover_focal_y" integer DEFAULT 50 NOT NULL,
  "cover_overlay_opacity" integer DEFAULT 25 NOT NULL,
  "grid_style" text DEFAULT 'masonry' NOT NULL,
  "thumbnail_size" text DEFAULT 'regular' NOT NULL,
  "grid_spacing" text DEFAULT 'regular' NOT NULL,
  "navigation_style" text DEFAULT 'icons-and-text' NOT NULL,
  "custom_css" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "name" text DEFAULT 'Default' NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "type" text DEFAULT 'preset' NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "layout" text DEFAULT 'masonry' NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "accent_color" text DEFAULT '#000000' NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "background_color" text DEFAULT '#ffffff' NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "text_color" text DEFAULT '#000000' NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "border_radius" integer DEFAULT 0 NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "show_title" boolean DEFAULT true NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "show_description" boolean DEFAULT true NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "show_collections" boolean DEFAULT true NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "show_logo" boolean DEFAULT true NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "masonry_columns" integer DEFAULT 4 NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "aspect_ratio" text DEFAULT 'auto' NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "font_family" text DEFAULT 'sans' NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "cover_style" text DEFAULT 'image' NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "cover_focal_x" integer DEFAULT 50 NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "cover_focal_y" integer DEFAULT 50 NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "cover_overlay_opacity" integer DEFAULT 25 NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "grid_style" text DEFAULT 'masonry' NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "thumbnail_size" text DEFAULT 'regular' NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "grid_spacing" text DEFAULT 'regular' NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "navigation_style" text DEFAULT 'icons-and-text' NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "custom_css" text;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;
ALTER TABLE "gallery_themes" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gallery_themes_gallery_id_galleries_id_fk'
      AND conrelid = '"gallery_themes"'::regclass
  ) THEN
    ALTER TABLE "gallery_themes"
      ADD CONSTRAINT "gallery_themes_gallery_id_galleries_id_fk"
      FOREIGN KEY ("gallery_id") REFERENCES "galleries"("id") ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gallery_themes_gallery_id_unique'
      AND conrelid = '"gallery_themes"'::regclass
  ) THEN
    ALTER TABLE "gallery_themes"
      ADD CONSTRAINT "gallery_themes_gallery_id_unique" UNIQUE ("gallery_id");
  END IF;
END $$;
