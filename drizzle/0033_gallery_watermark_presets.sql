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
CREATE INDEX IF NOT EXISTS "gallery_watermark_presets_creator_idx" ON "gallery_watermark_presets" USING btree ("creator_id");
