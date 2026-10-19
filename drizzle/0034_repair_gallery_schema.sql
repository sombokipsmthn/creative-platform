ALTER TABLE "galleries"
  ADD COLUMN IF NOT EXISTS "focal_point" jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS "expires_at" timestamp,
  ADD COLUMN IF NOT EXISTS "expiry_behavior" text DEFAULT 'hide' NOT NULL;

ALTER TABLE "gallery_photos"
  ADD COLUMN IF NOT EXISTS "original_path" text,
  ADD COLUMN IF NOT EXISTS "display_path" text,
  ADD COLUMN IF NOT EXISTS "thumbnail_path" text,
  ADD COLUMN IF NOT EXISTS "watermark_path" text,
  ADD COLUMN IF NOT EXISTS "processing_status" text DEFAULT 'ready' NOT NULL,
  ADD COLUMN IF NOT EXISTS "processing_error" text,
  ADD COLUMN IF NOT EXISTS "alt_text" text DEFAULT '',
  ADD COLUMN IF NOT EXISTS "caption" text DEFAULT '',
  ADD COLUMN IF NOT EXISTS "is_cover" boolean DEFAULT false NOT NULL;

CREATE TABLE IF NOT EXISTS "gallery_watermark_presets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "creator_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "text" text DEFAULT 'KIPSMTHN' NOT NULL,
  "position" text DEFAULT 'bottom-right' NOT NULL,
  "opacity" integer DEFAULT 55 NOT NULL,
  "font_size" integer DEFAULT 42 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "gallery_watermark_presets_creator_name_key" UNIQUE("creator_id", "name")
);

CREATE INDEX IF NOT EXISTS "gallery_watermark_presets_creator_idx"
  ON "gallery_watermark_presets" USING btree ("creator_id");
