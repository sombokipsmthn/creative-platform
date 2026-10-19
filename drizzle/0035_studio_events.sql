CREATE TABLE IF NOT EXISTS "studio_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "creator_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "client_id" text REFERENCES "clients"("id") ON DELETE SET NULL,
  "project_id" uuid REFERENCES "projects"("id") ON DELETE SET NULL,
  "title" text NOT NULL,
  "description" text,
  "event_type" text DEFAULT 'client_event' NOT NULL,
  "status" text DEFAULT 'planned' NOT NULL,
  "starts_at" timestamp NOT NULL,
  "ends_at" timestamp,
  "all_day" boolean DEFAULT false NOT NULL,
  "location" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "studio_events_creator_id_idx" ON "studio_events" USING btree ("creator_id");
CREATE INDEX IF NOT EXISTS "studio_events_client_id_idx" ON "studio_events" USING btree ("client_id");
CREATE INDEX IF NOT EXISTS "studio_events_project_id_idx" ON "studio_events" USING btree ("project_id");
CREATE INDEX IF NOT EXISTS "studio_events_starts_at_idx" ON "studio_events" USING btree ("starts_at");
