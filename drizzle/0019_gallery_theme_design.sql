-- Extend gallery themes with the design controls used by the client-gallery editor.
-- These are intentionally collection/gallery-level settings so a creator can
-- tune each delivery independently while keeping the existing preset fields.
ALTER TABLE gallery_themes
  ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'sans' NOT NULL,
  ADD COLUMN IF NOT EXISTS cover_style text DEFAULT 'image' NOT NULL,
  ADD COLUMN IF NOT EXISTS cover_focal_x integer DEFAULT 50 NOT NULL,
  ADD COLUMN IF NOT EXISTS cover_focal_y integer DEFAULT 50 NOT NULL,
  ADD COLUMN IF NOT EXISTS cover_overlay_opacity integer DEFAULT 25 NOT NULL,
  ADD COLUMN IF NOT EXISTS grid_style text DEFAULT 'masonry' NOT NULL,
  ADD COLUMN IF NOT EXISTS thumbnail_size text DEFAULT 'regular' NOT NULL,
  ADD COLUMN IF NOT EXISTS grid_spacing text DEFAULT 'regular' NOT NULL,
  ADD COLUMN IF NOT EXISTS navigation_style text DEFAULT 'icons-and-text' NOT NULL,
  ADD COLUMN IF NOT EXISTS show_logo boolean DEFAULT true NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gallery_themes_updated_at
  ON gallery_themes(updated_at);
