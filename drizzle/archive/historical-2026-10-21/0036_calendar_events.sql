CREATE TABLE IF NOT EXISTS "calendar_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "creator_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "client_id" text REFERENCES "clients"("id") ON DELETE SET NULL,
  "project_id" uuid REFERENCES "projects"("id") ON DELETE SET NULL,
  "title" text NOT NULL,
  "description" text,
  "start_date" timestamp NOT NULL,
  "end_date" timestamp NOT NULL,
  "location" text,
  "event_type" text DEFAULT 'appointment' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "calendar_events_creator_id_idx" ON "calendar_events" USING btree ("creator_id");
CREATE INDEX IF NOT EXISTS "calendar_events_start_date_idx" ON "calendar_events" USING btree ("start_date");
