ALTER TABLE "gallery_watermarks" ADD COLUMN IF NOT EXISTS "type" text DEFAULT 'text' NOT NULL;
ALTER TABLE "gallery_watermarks" ADD COLUMN IF NOT EXISTS "image_url" text;
ALTER TABLE "gallery_watermarks" ADD COLUMN IF NOT EXISTS "image_path" text;
ALTER TABLE "gallery_watermarks" ADD COLUMN IF NOT EXISTS "image_filename" text;
ALTER TABLE "gallery_watermarks" ADD COLUMN IF NOT EXISTS "image_mime_type" text;

ALTER TABLE "gallery_watermark_presets" ADD COLUMN IF NOT EXISTS "type" text DEFAULT 'text' NOT NULL;
ALTER TABLE "gallery_watermark_presets" ADD COLUMN IF NOT EXISTS "image_url" text;
ALTER TABLE "gallery_watermark_presets" ADD COLUMN IF NOT EXISTS "image_path" text;
ALTER TABLE "gallery_watermark_presets" ADD COLUMN IF NOT EXISTS "image_filename" text;
ALTER TABLE "gallery_watermark_presets" ADD COLUMN IF NOT EXISTS "image_mime_type" text;
