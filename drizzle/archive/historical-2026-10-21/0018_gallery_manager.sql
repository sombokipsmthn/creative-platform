/*
|--------------------------------------------------------------------------
| Gallery Manager V2
|--------------------------------------------------------------------------
| Adds gallery core compatibility, expiry, client sessions/actions,
| proofing comments, approval, download presets/tracking, watermark
| settings and processed variants.
|--------------------------------------------------------------------------
*/

CREATE TABLE IF NOT EXISTS galleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id text REFERENCES clients(id) ON DELETE SET NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  category text,
  slug text NOT NULL UNIQUE,
  access_pin text,
  status text NOT NULL DEFAULT 'draft',
  cover_photo_id uuid,
  allow_downloads boolean NOT NULL DEFAULT true,
  allow_favorites boolean NOT NULL DEFAULT true,
  allow_selections boolean NOT NULL DEFAULT true,
  published_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES gallery_collections(id) ON DELETE SET NULL,
  filename text NOT NULL,
  original_url text NOT NULL,
  display_url text NOT NULL,
  thumbnail_url text NOT NULL,
  storage_path text,
  mime_type text,
  file_size bigint,
  width integer,
  height integer,
  capture_date timestamp,
  sort_order integer NOT NULL DEFAULT 0,
  is_hidden boolean NOT NULL DEFAULT false,
  is_favorite boolean NOT NULL DEFAULT false,
  is_selected boolean NOT NULL DEFAULT false,
  download_count integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'galleries_cover_photo_fk'
  ) THEN
    ALTER TABLE galleries
      ADD CONSTRAINT galleries_cover_photo_fk
      FOREIGN KEY (cover_photo_id)
      REFERENCES gallery_photos(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS galleries_creator_id_idx ON galleries(creator_id);
CREATE INDEX IF NOT EXISTS galleries_client_id_idx ON galleries(client_id);
CREATE INDEX IF NOT EXISTS galleries_project_id_idx ON galleries(project_id);
CREATE INDEX IF NOT EXISTS galleries_slug_idx ON galleries(slug);
CREATE INDEX IF NOT EXISTS gallery_collections_gallery_id_idx ON gallery_collections(gallery_id);
CREATE INDEX IF NOT EXISTS gallery_photos_gallery_id_idx ON gallery_photos(gallery_id);
CREATE INDEX IF NOT EXISTS gallery_photos_collection_id_idx ON gallery_photos(collection_id);
CREATE INDEX IF NOT EXISTS gallery_photos_sort_order_idx ON gallery_photos(gallery_id, collection_id, sort_order);

ALTER TABLE galleries
  ADD COLUMN IF NOT EXISTS expires_at timestamp,
  ADD COLUMN IF NOT EXISTS expiry_behavior text NOT NULL DEFAULT 'hide';

ALTER TABLE gallery_photos
  ADD COLUMN IF NOT EXISTS processing_status text NOT NULL DEFAULT 'ready',
  ADD COLUMN IF NOT EXISTS processing_error text,
  ADD COLUMN IF NOT EXISTS original_path text,
  ADD COLUMN IF NOT EXISTS display_path text,
  ADD COLUMN IF NOT EXISTS thumbnail_path text,
  ADD COLUMN IF NOT EXISTS watermark_path text;

CREATE TABLE IF NOT EXISTS gallery_access_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  client_id text REFERENCES clients(id) ON DELETE SET NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  last_seen_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS gallery_access_sessions_gallery_idx ON gallery_access_sessions(gallery_id);

CREATE TABLE IF NOT EXISTS gallery_photo_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES gallery_access_sessions(id) ON DELETE CASCADE,
  gallery_id uuid NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  photo_id uuid NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
  is_favorite boolean NOT NULL DEFAULT false,
  is_selected boolean NOT NULL DEFAULT false,
  updated_at timestamp NOT NULL DEFAULT now(),
  UNIQUE(session_id, photo_id)
);
CREATE INDEX IF NOT EXISTS gallery_photo_actions_gallery_idx ON gallery_photo_actions(gallery_id);
CREATE INDEX IF NOT EXISTS gallery_photo_actions_photo_idx ON gallery_photo_actions(photo_id);

CREATE TABLE IF NOT EXISTS gallery_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  photo_id uuid NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
  session_id uuid REFERENCES gallery_access_sessions(id) ON DELETE SET NULL,
  author_type text NOT NULL DEFAULT 'client',
  author_name text NOT NULL DEFAULT 'Client',
  body text NOT NULL,
  resolved_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS gallery_comments_photo_idx ON gallery_comments(photo_id, created_at);

CREATE TABLE IF NOT EXISTS gallery_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL UNIQUE REFERENCES galleries(id) ON DELETE CASCADE,
  client_id text REFERENCES clients(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamp,
  responded_at timestamp,
  response_note text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery_watermarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL UNIQUE REFERENCES galleries(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  text text NOT NULL DEFAULT 'KIPSMTHN',
  position text NOT NULL DEFAULT 'bottom-right',
  opacity integer NOT NULL DEFAULT 55,
  font_size integer NOT NULL DEFAULT 42,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery_download_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  name text NOT NULL,
  variant text NOT NULL DEFAULT 'display',
  max_width integer,
  quality integer NOT NULL DEFAULT 90,
  format text NOT NULL DEFAULT 'jpg',
  include_watermark boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS gallery_download_presets_gallery_idx ON gallery_download_presets(gallery_id);

CREATE TABLE IF NOT EXISTS gallery_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  photo_id uuid REFERENCES gallery_photos(id) ON DELETE SET NULL,
  preset_id uuid REFERENCES gallery_download_presets(id) ON DELETE SET NULL,
  session_id uuid REFERENCES gallery_access_sessions(id) ON DELETE SET NULL,
  download_type text NOT NULL DEFAULT 'single',
  filename text,
  bytes bigint,
  ip_hash text,
  user_agent text,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS gallery_downloads_gallery_idx ON gallery_downloads(gallery_id, created_at);
CREATE INDEX IF NOT EXISTS gallery_downloads_photo_idx ON gallery_downloads(photo_id, created_at);

INSERT INTO gallery_watermarks (gallery_id)
SELECT id FROM galleries
WHERE NOT EXISTS (SELECT 1 FROM gallery_watermarks w WHERE w.gallery_id = galleries.id);

INSERT INTO gallery_download_presets (gallery_id, name, variant, max_width, quality, format, include_watermark)
SELECT g.id, 'Web Delivery', 'display', 2400, 88, 'jpg', false
FROM galleries g
WHERE NOT EXISTS (SELECT 1 FROM gallery_download_presets p WHERE p.gallery_id = g.id);

CREATE INDEX IF NOT EXISTS galleries_expires_at_idx ON galleries(expires_at);
