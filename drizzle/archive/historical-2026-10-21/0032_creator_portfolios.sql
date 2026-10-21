CREATE TABLE IF NOT EXISTS "creator_portfolios" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "headline" text,
  "contact_email" text,
  "social_links" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "selected_project_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "layout" text DEFAULT 'editorial' NOT NULL,
  "is_published" boolean DEFAULT false NOT NULL,
  "published_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "creator_portfolios_published_idx" ON "creator_portfolios" ("is_published");
