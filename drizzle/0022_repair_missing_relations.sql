-- Repair databases where the gallery/contract migration was not applied.

CREATE TABLE IF NOT EXISTS contract_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id text REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  document_type text NOT NULL,
  content text NOT NULL,
  variables jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_system_template boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id text NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL,
  template_id uuid REFERENCES contract_templates(id) ON DELETE SET NULL,
  title text NOT NULL,
  contract_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft',
  content text NOT NULL,
  currency text DEFAULT 'KES',
  total_amount integer,
  token text NOT NULL UNIQUE,
  expires_at timestamp,
  sent_at timestamp,
  viewed_at timestamp,
  signed_at timestamp,
  declined_at timestamp,
  cancelled_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contract_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery_access_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  client_id text REFERENCES clients(id) ON DELETE SET NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  last_seen_at timestamp NOT NULL DEFAULT now()
);

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

CREATE INDEX IF NOT EXISTS gallery_access_sessions_gallery_idx
  ON gallery_access_sessions(gallery_id);
CREATE INDEX IF NOT EXISTS gallery_comments_photo_idx
  ON gallery_comments(photo_id, created_at);
CREATE INDEX IF NOT EXISTS gallery_download_presets_gallery_idx
  ON gallery_download_presets(gallery_id);
CREATE INDEX IF NOT EXISTS gallery_downloads_gallery_idx
  ON gallery_downloads(gallery_id, created_at);
CREATE INDEX IF NOT EXISTS gallery_downloads_photo_idx
  ON gallery_downloads(photo_id, created_at);

CREATE INDEX IF NOT EXISTS contract_templates_creator_id_idx
  ON contract_templates(creator_id);
CREATE INDEX IF NOT EXISTS contracts_creator_id_idx
  ON contracts(creator_id);
CREATE INDEX IF NOT EXISTS contract_events_contract_id_idx
  ON contract_events(contract_id);
CREATE INDEX IF NOT EXISTS gallery_photo_actions_gallery_idx
  ON gallery_photo_actions(gallery_id);
CREATE INDEX IF NOT EXISTS gallery_photo_actions_photo_idx
  ON gallery_photo_actions(photo_id);
