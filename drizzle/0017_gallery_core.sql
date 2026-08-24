/*
|--------------------------------------------------------------------------
| Gallery Core V1
|--------------------------------------------------------------------------
*/

CREATE TABLE IF NOT EXISTS galleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  creator_id text NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  client_id text
    REFERENCES clients(id)
    ON DELETE SET NULL,

  project_id uuid
    REFERENCES projects(id)
    ON DELETE SET NULL,

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

  gallery_id uuid NOT NULL
    REFERENCES galleries(id)
    ON DELETE CASCADE,

  title text NOT NULL,

  description text,

  sort_order integer NOT NULL DEFAULT 0,

  created_at timestamp NOT NULL DEFAULT now(),

  updated_at timestamp NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  gallery_id uuid NOT NULL
    REFERENCES galleries(id)
    ON DELETE CASCADE,

  collection_id uuid
    REFERENCES gallery_collections(id)
    ON DELETE SET NULL,

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


ALTER TABLE galleries
ADD CONSTRAINT galleries_cover_photo_fk
FOREIGN KEY (cover_photo_id)
REFERENCES gallery_photos(id)
ON DELETE SET NULL;


CREATE INDEX IF NOT EXISTS galleries_creator_id_idx
ON galleries(creator_id);

CREATE INDEX IF NOT EXISTS galleries_client_id_idx
ON galleries(client_id);

CREATE INDEX IF NOT EXISTS galleries_project_id_idx
ON galleries(project_id);

CREATE INDEX IF NOT EXISTS galleries_slug_idx
ON galleries(slug);

CREATE INDEX IF NOT EXISTS gallery_collections_gallery_id_idx
ON gallery_collections(gallery_id);

CREATE INDEX IF NOT EXISTS gallery_photos_gallery_id_idx
ON gallery_photos(gallery_id);

CREATE INDEX IF NOT EXISTS gallery_photos_collection_id_idx
ON gallery_photos(collection_id);

CREATE INDEX IF NOT EXISTS gallery_photos_sort_order_idx
ON gallery_photos(gallery_id, collection_id, sort_order);