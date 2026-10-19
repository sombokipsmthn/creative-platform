-- Forward migration to bring the database to the current schema state.
-- Applies all missing tables, columns, indexes, and constraints that have not
-- yet been recorded in __drizzle_migrations.

-- ==================== contracts ====================
CREATE TABLE IF NOT EXISTS "contracts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "creator_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "client_id" text NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "project_id" uuid REFERENCES "projects"("id") ON DELETE SET NULL,
  "quote_id" uuid REFERENCES "quotes"("id") ON DELETE SET NULL,
  "template_id" uuid REFERENCES "contract_templates"("id") ON DELETE SET NULL,
  "title" text NOT NULL,
  "contract_number" text NOT NULL UNIQUE,
  "status" text NOT NULL DEFAULT 'draft',
  "content" text NOT NULL,
  "currency" text DEFAULT 'KES',
  "total_amount" integer,
  "token" text NOT NULL UNIQUE,
  "expires_at" timestamp,
  "sent_at" timestamp,
  "viewed_at" timestamp,
  "signed_at" timestamp,
  "signer_name" text,
  "signer_email" text,
  "signed_ip" text,
  "signed_user_agent" text,
  "declined_at" timestamp,
  "cancelled_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "contracts_creator_id_idx" ON "contracts"("creator_id");
CREATE INDEX IF NOT EXISTS "contracts_client_id_idx" ON "contracts"("client_id");
CREATE INDEX IF NOT EXISTS "contracts_project_id_idx" ON "contracts"("project_id");
CREATE INDEX IF NOT EXISTS "contracts_quote_id_idx" ON "contracts"("quote_id");
CREATE INDEX IF NOT EXISTS "contracts_template_id_idx" ON "contracts"("template_id");
CREATE INDEX IF NOT EXISTS "contracts_status_idx" ON "contracts"("status");
CREATE INDEX IF NOT EXISTS "contracts_token_idx" ON "contracts"("token");

-- ==================== contract_templates ====================
CREATE TABLE IF NOT EXISTS "contract_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "creator_id" text REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "description" text,
  "category" text NOT NULL,
  "document_type" text NOT NULL,
  "content" text NOT NULL,
  "variables" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "is_system_template" boolean NOT NULL DEFAULT false,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "contract_templates_creator_id_idx" ON "contract_templates"("creator_id");
CREATE INDEX IF NOT EXISTS "contract_templates_is_system_idx" ON "contract_templates"("is_system_template");

-- ==================== contract_events ====================
CREATE TABLE IF NOT EXISTS "contract_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "contract_id" uuid NOT NULL REFERENCES "contracts"("id") ON DELETE CASCADE,
  "event_type" text NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "contract_events_contract_id_idx" ON "contract_events"("contract_id");

-- ==================== galleries (core) ====================
CREATE TABLE IF NOT EXISTS "galleries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "creator_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "client_id" text REFERENCES "clients"("id") ON DELETE SET NULL,
  "project_id" uuid REFERENCES "projects"("id") ON DELETE SET NULL,
  "title" text NOT NULL,
  "description" text,
  "category" text,
  "slug" text NOT NULL UNIQUE,
  "access_pin" text,
  "status" text NOT NULL DEFAULT 'draft',
  "cover_photo_id" uuid,
  "allow_downloads" boolean NOT NULL DEFAULT true,
  "allow_favorites" boolean NOT NULL DEFAULT true,
  "allow_selections" boolean NOT NULL DEFAULT true,
  "focal_point" jsonb DEFAULT '{}'::jsonb,
  "expires_at" timestamp,
  "expiry_behavior" text NOT NULL DEFAULT 'hide',
  "published_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

ALTER TABLE "galleries"
  ADD CONSTRAINT "galleries_cover_photo_fk"
  FOREIGN KEY ("cover_photo_id") REFERENCES "gallery_photos"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "galleries_creator_id_idx" ON "galleries"("creator_id");
CREATE INDEX IF NOT EXISTS "galleries_client_id_idx" ON "galleries"("client_id");
CREATE INDEX IF NOT EXISTS "galleries_project_id_idx" ON "galleries"("project_id");
CREATE INDEX IF NOT EXISTS "galleries_slug_idx" ON "galleries"("slug");
CREATE INDEX IF NOT EXISTS "galleries_expires_at_idx" ON "galleries"("expires_at");

-- ==================== gallery_collections ====================
CREATE TABLE IF NOT EXISTS "gallery_collections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "gallery_id" uuid NOT NULL REFERENCES "galleries"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "gallery_collections_gallery_id_idx" ON "gallery_collections"("gallery_id");

-- ==================== gallery_photos ====================
CREATE TABLE IF NOT EXISTS "gallery_photos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "gallery_id" uuid NOT NULL REFERENCES "galleries"("id") ON DELETE CASCADE,
  "collection_id" uuid REFERENCES "gallery_collections"("id") ON DELETE SET NULL,
  "filename" text NOT NULL,
  "original_url" text NOT NULL,
  "display_url" text NOT NULL,
  "thumbnail_url" text NOT NULL,
  "storage_path" text,
  "original_path" text,
  "display_path" text,
  "thumbnail_path" text,
  "watermark_path" text,
  "processing_status" text NOT NULL DEFAULT 'ready',
  "processing_error" text,
  "mime_type" text,
  "file_size" bigint,
  "width" integer,
  "height" integer,
  "capture_date" timestamp,
  "sort_order" integer NOT NULL DEFAULT 0,
  "is_hidden" boolean NOT NULL DEFAULT false,
  "is_favorite" boolean NOT NULL DEFAULT false,
  "is_selected" boolean NOT NULL DEFAULT false,
  "download_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "gallery_photos_gallery_id_idx" ON "gallery_photos"("gallery_id");
CREATE INDEX IF NOT EXISTS "gallery_photos_collection_id_idx" ON "gallery_photos"("collection_id");
CREATE INDEX IF NOT EXISTS "gallery_photos_gallery_collection_sort_idx" ON "gallery_photos"("gallery_id", "collection_id", "sort_order");

-- ==================== gallery_access_sessions ====================
CREATE TABLE IF NOT EXISTS "gallery_access_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "gallery_id" uuid NOT NULL REFERENCES "galleries"("id") ON DELETE CASCADE,
  "client_id" text REFERENCES "clients"("id") ON DELETE SET NULL,
  "token_hash" text NOT NULL UNIQUE,
  "expires_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "last_seen_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "gallery_access_sessions_gallery_idx" ON "gallery_access_sessions"("gallery_id");

-- ==================== gallery_access_attempts ====================
CREATE TABLE IF NOT EXISTS "gallery_access_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "gallery_id" uuid NOT NULL REFERENCES "galleries"("id") ON DELETE CASCADE,
  "ip_address" text NOT NULL,
  "attempt_count" integer NOT NULL DEFAULT 0,
  "last_attempt_at" timestamp NOT NULL DEFAULT now(),
  "lockout_until" timestamp,
  UNIQUE("gallery_id", "ip_address")
);

-- ==================== gallery_photo_actions ====================
CREATE TABLE IF NOT EXISTS "gallery_photo_actions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" uuid NOT NULL REFERENCES "gallery_access_sessions"("id") ON DELETE CASCADE,
  "gallery_id" uuid NOT NULL REFERENCES "galleries"("id") ON DELETE CASCADE,
  "photo_id" uuid NOT NULL REFERENCES "gallery_photos"("id") ON DELETE CASCADE,
  "is_favorite" boolean NOT NULL DEFAULT false,
  "is_selected" boolean NOT NULL DEFAULT false,
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "gallery_photo_actions_session_photo_unique" UNIQUE("session_id", "photo_id")
);

CREATE INDEX IF NOT EXISTS "gallery_photo_actions_gallery_idx" ON "gallery_photo_actions"("gallery_id");
CREATE INDEX IF NOT EXISTS "gallery_photo_actions_photo_idx" ON "gallery_photo_actions"("photo_id");

-- ==================== gallery_comments ====================
CREATE TABLE IF NOT EXISTS "gallery_comments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "gallery_id" uuid NOT NULL REFERENCES "galleries"("id") ON DELETE CASCADE,
  "photo_id" uuid NOT NULL REFERENCES "gallery_photos"("id") ON DELETE CASCADE,
  "session_id" uuid REFERENCES "gallery_access_sessions"("id") ON DELETE SET NULL,
  "author_type" text NOT NULL DEFAULT 'client',
  "author_name" text NOT NULL DEFAULT 'Client',
  "body" text NOT NULL,
  "resolved_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "gallery_comments_photo_created_idx" ON "gallery_comments"("photo_id", "created_at");

-- ==================== gallery_activity ====================
CREATE TABLE IF NOT EXISTS "gallery_activity" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "gallery_id" uuid NOT NULL REFERENCES "galleries"("id") ON DELETE CASCADE,
  "session_id" uuid REFERENCES "gallery_access_sessions"("id") ON DELETE SET NULL,
  "photo_id" uuid REFERENCES "gallery_photos"("id") ON DELETE SET NULL,
  "collection_id" uuid REFERENCES "gallery_collections"("id") ON DELETE SET NULL,
  "event_type" text NOT NULL,
  "client_name" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- ==================== gallery_themes ====================
CREATE TABLE IF NOT EXISTS "gallery_themes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "gallery_id" uuid NOT NULL UNIQUE REFERENCES "galleries"("id") ON DELETE CASCADE,
  "name" text NOT NULL DEFAULT 'Default',
  "type" text NOT NULL DEFAULT 'preset',
  "layout" text NOT NULL DEFAULT 'masonry',
  "accent_color" text NOT NULL DEFAULT '#000000',
  "background_color" text NOT NULL DEFAULT '#ffffff',
  "text_color" text NOT NULL DEFAULT '#000000',
  "border_radius" integer NOT NULL DEFAULT 0,
  "show_title" boolean NOT NULL DEFAULT true,
  "show_description" boolean NOT NULL DEFAULT true,
  "show_collections" boolean NOT NULL DEFAULT true,
  "show_logo" boolean NOT NULL DEFAULT true,
  "masonry_columns" integer NOT NULL DEFAULT 4,
  "aspect_ratio" text NOT NULL DEFAULT 'auto',
  "font_family" text NOT NULL DEFAULT 'sans',
  "cover_style" text NOT NULL DEFAULT 'image',
  "cover_focal_x" integer NOT NULL DEFAULT 50,
  "cover_focal_y" integer NOT NULL DEFAULT 50,
  "cover_overlay_opacity" integer NOT NULL DEFAULT 25,
  "grid_style" text NOT NULL DEFAULT 'masonry',
  "thumbnail_size" text NOT NULL DEFAULT 'regular',
  "grid_spacing" text NOT NULL DEFAULT 'regular',
  "navigation_style" text NOT NULL DEFAULT 'icons-and-text',
  "custom_css" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- ==================== gallery_approvals ====================
CREATE TABLE IF NOT EXISTS "gallery_approvals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "gallery_id" uuid NOT NULL UNIQUE REFERENCES "galleries"("id") ON DELETE CASCADE,
  "client_id" text REFERENCES "clients"("id") ON DELETE SET NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "requested_at" timestamp,
  "responded_at" timestamp,
  "response_note" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- ==================== gallery_watermarks ====================
CREATE TABLE IF NOT EXISTS "gallery_watermarks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "gallery_id" uuid NOT NULL UNIQUE REFERENCES "galleries"("id") ON DELETE CASCADE,
  "enabled" boolean NOT NULL DEFAULT true,
  "text" text NOT NULL DEFAULT 'KIPSMTHN',
  "position" text NOT NULL DEFAULT 'bottom-right',
  "opacity" integer NOT NULL DEFAULT 55,
  "font_size" integer NOT NULL DEFAULT 42,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- ==================== gallery_download_presets ====================
CREATE TABLE IF NOT EXISTS "gallery_download_presets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "gallery_id" uuid NOT NULL REFERENCES "galleries"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "variant" text NOT NULL DEFAULT 'display',
  "max_width" integer,
  "quality" integer NOT NULL DEFAULT 90,
  "format" text NOT NULL DEFAULT 'jpg',
  "include_watermark" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "gallery_download_presets_gallery_idx" ON "gallery_download_presets"("gallery_id");

-- ==================== gallery_downloads ====================
CREATE TABLE IF NOT EXISTS "gallery_downloads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "gallery_id" uuid NOT NULL REFERENCES "galleries"("id") ON DELETE CASCADE,
  "photo_id" uuid REFERENCES "gallery_photos"("id") ON DELETE SET NULL,
  "preset_id" uuid REFERENCES "gallery_download_presets"("id") ON DELETE SET NULL,
  "session_id" uuid REFERENCES "gallery_access_sessions"("id") ON DELETE SET NULL,
  "download_type" text NOT NULL DEFAULT 'single',
  "filename" text,
  "bytes" bigint,
  "ip_hash" text,
  "user_agent" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "gallery_downloads_gallery_created_idx" ON "gallery_downloads"("gallery_id", "created_at");
CREATE INDEX IF NOT EXISTS "gallery_downloads_photo_created_idx" ON "gallery_downloads"("photo_id", "created_at");

-- ==================== upload_audit ====================
CREATE TABLE IF NOT EXISTS "upload_audit" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "gallery_id" uuid NOT NULL REFERENCES "galleries"("id") ON DELETE CASCADE,
  "filename" text NOT NULL,
  "mime_type" text NOT NULL,
  "file_size" bigint NOT NULL,
  "blob_path" text NOT NULL,
  "success" boolean NOT NULL,
  "failure_reason" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- ==================== Seeded data ====================
-- Insert default watermark and download preset for every existing gallery
INSERT INTO "gallery_watermarks" ("gallery_id")
SELECT "id" FROM "galleries"
WHERE NOT EXISTS (
  SELECT 1 FROM "gallery_watermarks" w WHERE w."gallery_id" = "galleries".id
);

INSERT INTO "gallery_download_presets" ("gallery_id", "name", "variant", "max_width", "quality", "format", "include_watermark")
SELECT g."id", 'Web Delivery', 'display', 2400, 88, 'jpg', false
FROM "galleries" g
WHERE NOT EXISTS (
  SELECT 1 FROM "gallery_download_presets" p WHERE p."gallery_id" = g."id"
);

-- ==================== Update __drizzle_migrations ====================
-- Mark this migration as applied
INSERT INTO "__drizzle_migrations" ("hash", "created_at")
VALUES (
  md5('forward-migration-fix-missing-objects-' || extract(epoch from now())::text),
  now()
);
