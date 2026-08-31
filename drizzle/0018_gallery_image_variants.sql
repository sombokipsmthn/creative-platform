-- Add missing image variant columns to gallery_photos
ALTER TABLE gallery_photos
ADD COLUMN IF NOT EXISTS original_path text,
ADD COLUMN IF NOT EXISTS display_path text,
ADD COLUMN IF NOT EXISTS thumbnail_path text,
ADD COLUMN IF NOT EXISTS watermark_path text,
ADD COLUMN IF NOT EXISTS processing_status text DEFAULT 'pending' NOT NULL;

-- Add gallery_themes table
CREATE TABLE IF NOT EXISTS gallery_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL UNIQUE REFERENCES galleries(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text DEFAULT 'custom' NOT NULL,
  layout text DEFAULT 'masonry' NOT NULL,
  accent_color text DEFAULT '#000000' NOT NULL,
  background_color text DEFAULT '#ffffff' NOT NULL,
  text_color text DEFAULT '#000000' NOT NULL,
  border_radius integer DEFAULT 0 NOT NULL,
  show_title boolean DEFAULT true NOT NULL,
  show_description boolean DEFAULT true NOT NULL,
  show_collections boolean DEFAULT true NOT NULL,
  masonry_columns integer DEFAULT 4 NOT NULL,
  aspect_ratio text DEFAULT 'auto' NOT NULL,
  custom_css text,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_gallery_photos_gallery_id ON gallery_photos(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_sort_order ON gallery_photos(gallery_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_themes_gallery_id ON gallery_themes(gallery_id);
