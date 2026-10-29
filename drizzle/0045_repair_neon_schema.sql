-- Idempotent repair for watermark schema drift.
ALTER TABLE "gallery_watermarks"
  ADD COLUMN IF NOT EXISTS "type" text DEFAULT 'text' NOT NULL,
  ADD COLUMN IF NOT EXISTS "image_url" text,
  ADD COLUMN IF NOT EXISTS "image_path" text,
  ADD COLUMN IF NOT EXISTS "image_filename" text,
  ADD COLUMN IF NOT EXISTS "image_mime_type" text;

CREATE TABLE IF NOT EXISTS "gallery_watermark_presets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "creator_id" text NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "type" text DEFAULT 'text' NOT NULL,
  "text" text DEFAULT 'KIPSMTHN' NOT NULL,
  "position" text DEFAULT 'bottom-right' NOT NULL,
  "opacity" integer DEFAULT 55 NOT NULL,
  "font_size" integer DEFAULT 42 NOT NULL,
  "image_url" text,
  "image_path" text,
  "image_filename" text,
  "image_mime_type" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "gallery_watermark_presets_creator_name_key" UNIQUE ("creator_id", "name")
);
CREATE INDEX IF NOT EXISTS "gallery_watermark_presets_creator_idx"
  ON "gallery_watermark_presets" USING btree ("creator_id");

-- Restore tables and columns missing from databases that were marked as current
-- by the baseline migration before these schema objects were applied.

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

CREATE TABLE IF NOT EXISTS "creator_workspace_branding" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "custom_domain" text,
  "hide_platform_branding" boolean DEFAULT true NOT NULL,
  "header_logo_url" text,
  "favicon_url" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_creator_workspace_branding_user_id" ON "creator_workspace_branding" ("user_id");

CREATE TABLE IF NOT EXISTS "creator_email_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "invitation_subject" text DEFAULT 'Your Private Client Gallery is Ready — KIPSMTHN' NOT NULL,
  "invitation_body" text DEFAULT 'Hello {ClientName},\n\nYour private gallery "{GalleryTitle}" is now live on KIPSMTHN.\n\nUse your access PIN: {PIN} to view, favorite, and download your deliverables.\n\nBest regards,\n{CreatorName}' NOT NULL,
  "reminder_subject" text DEFAULT 'Reminder: Your gallery "{GalleryTitle}" expires in {DaysRemaining} days' NOT NULL,
  "reminder_body" text DEFAULT 'Hello {ClientName},\n\nThis is a friendly reminder that your access to "{GalleryTitle}" will expire on {ExpiryDate}.\n\nVisit the gallery to make your final selections and downloads.\n\nBest regards,\n{CreatorName}' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_creator_email_templates_user_id" ON "creator_email_templates" ("user_id");

CREATE TABLE IF NOT EXISTS "creator_notification_preferences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "gallery_selections" boolean DEFAULT true NOT NULL,
  "gallery_comments" boolean DEFAULT true NOT NULL,
  "gallery_shares" boolean DEFAULT true NOT NULL,
  "gallery_approvals" boolean DEFAULT true NOT NULL,
  "contract_signed" boolean DEFAULT true NOT NULL,
  "contract_viewed" boolean DEFAULT true NOT NULL,
  "contract_declined" boolean DEFAULT true NOT NULL,
  "invoice_paid" boolean DEFAULT true NOT NULL,
  "invoice_overdue" boolean DEFAULT true NOT NULL,
  "payment_received" boolean DEFAULT true NOT NULL,
  "email_enabled" boolean DEFAULT true NOT NULL,
  "in_app_enabled" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_creator_notification_preferences_user_id" ON "creator_notification_preferences" ("user_id");

CREATE TABLE IF NOT EXISTS "creator_integrations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "integration_key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "status" text DEFAULT 'inactive' NOT NULL,
  "config" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "connected_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "creator_integrations_user_key_unique" UNIQUE ("user_id", "integration_key")
);
CREATE INDEX IF NOT EXISTS "idx_creator_integrations_user_id" ON "creator_integrations" ("user_id");

CREATE TABLE IF NOT EXISTS "creator_gallery_defaults" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "default_photo_selection_limit" integer DEFAULT 25 NOT NULL,
  "default_expiration_days" integer DEFAULT 60 NOT NULL,
  "default_master_pin" text DEFAULT '4821' NOT NULL,
  "default_allow_downloads" boolean DEFAULT true NOT NULL,
  "default_allow_favorites" boolean DEFAULT true NOT NULL,
  "default_allow_selections" boolean DEFAULT true NOT NULL,
  "default_require_pin" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_creator_gallery_defaults_user_id" ON "creator_gallery_defaults" ("user_id");

CREATE TABLE IF NOT EXISTS "expenses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "creator_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "project_id" uuid REFERENCES "projects"("id") ON DELETE SET NULL,
  "description" text NOT NULL,
  "supplier" text,
  "category" text NOT NULL,
  "amount" integer NOT NULL,
  "currency" text DEFAULT 'KES' NOT NULL,
  "expense_date" timestamp NOT NULL,
  "payment_method" text,
  "tax_amount" integer DEFAULT 0 NOT NULL,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "expenses_creator_id_idx" ON "expenses" ("creator_id");
CREATE INDEX IF NOT EXISTS "expenses_project_id_idx" ON "expenses" ("project_id");
CREATE INDEX IF NOT EXISTS "expenses_expense_date_idx" ON "expenses" ("expense_date");

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
CREATE INDEX IF NOT EXISTS "studio_events_creator_id_idx" ON "studio_events" ("creator_id");
CREATE INDEX IF NOT EXISTS "studio_events_client_id_idx" ON "studio_events" ("client_id");
CREATE INDEX IF NOT EXISTS "studio_events_project_id_idx" ON "studio_events" ("project_id");
CREATE INDEX IF NOT EXISTS "studio_events_starts_at_idx" ON "studio_events" ("starts_at");

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
CREATE INDEX IF NOT EXISTS "calendar_events_creator_id_idx" ON "calendar_events" ("creator_id");
CREATE INDEX IF NOT EXISTS "calendar_events_start_date_idx" ON "calendar_events" ("start_date");

CREATE TABLE IF NOT EXISTS "payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "creator_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "client_id" text NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "invoice_id" uuid REFERENCES "invoices"("id") ON DELETE SET NULL,
  "project_id" uuid REFERENCES "projects"("id") ON DELETE SET NULL,
  "reference" text NOT NULL UNIQUE,
  "amount" integer NOT NULL,
  "currency" text NOT NULL,
  "method" text NOT NULL,
  "origin" text DEFAULT 'manual' NOT NULL,
  "status" text DEFAULT 'pending_verification' NOT NULL,
  "paid_at" timestamp NOT NULL,
  "confirmed_at" timestamp,
  "confirmed_by" text REFERENCES "users"("id") ON DELETE SET NULL,
  "transaction_reference" text,
  "evidence_reference" text,
  "notes" text,
  "reversal_reason" text,
  "related_payment_id" uuid,
  "provider_name" text,
  "external_transaction_id" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "payments_creator_id_idx" ON "payments" ("creator_id");
CREATE INDEX IF NOT EXISTS "payments_invoice_id_idx" ON "payments" ("invoice_id");
CREATE INDEX IF NOT EXISTS "payments_client_id_idx" ON "payments" ("client_id");
CREATE INDEX IF NOT EXISTS "payments_project_id_idx" ON "payments" ("project_id");
CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments" ("status");
CREATE INDEX IF NOT EXISTS "payments_paid_at_idx" ON "payments" ("paid_at");

CREATE TABLE IF NOT EXISTS "payment_schedules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "creator_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "client_id" text NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "invoice_id" uuid NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
  "project_id" uuid REFERENCES "projects"("id") ON DELETE SET NULL,
  "label" text NOT NULL,
  "amount" integer NOT NULL,
  "currency" text NOT NULL,
  "due_date" timestamp NOT NULL,
  "milestone" text,
  "status" text DEFAULT 'scheduled' NOT NULL,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "payment_schedules_creator_id_idx" ON "payment_schedules" ("creator_id");
CREATE INDEX IF NOT EXISTS "payment_schedules_invoice_id_idx" ON "payment_schedules" ("invoice_id");
CREATE INDEX IF NOT EXISTS "payment_schedules_due_date_idx" ON "payment_schedules" ("due_date");

CREATE TABLE IF NOT EXISTS "payment_term_amendments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "creator_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "invoice_id" uuid NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
  "previous_terms" text,
  "new_terms" text NOT NULL,
  "agreement_date" timestamp NOT NULL,
  "evidence_reference" text,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "payment_term_amendments_creator_id_idx" ON "payment_term_amendments" ("creator_id");
CREATE INDEX IF NOT EXISTS "payment_term_amendments_invoice_id_idx" ON "payment_term_amendments" ("invoice_id");

CREATE TABLE IF NOT EXISTS "payment_audit_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "creator_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "payment_id" uuid NOT NULL REFERENCES "payments"("id") ON DELETE CASCADE,
  "event_type" text NOT NULL,
  "actor_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "payment_audit_events_payment_id_idx" ON "payment_audit_events" ("payment_id");
CREATE INDEX IF NOT EXISTS "payment_audit_events_creator_id_idx" ON "payment_audit_events" ("creator_id");

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login_at" timestamp;
ALTER TABLE "galleries" ADD COLUMN IF NOT EXISTS "portfolio_publish_mode" text DEFAULT 'none' NOT NULL;
ALTER TABLE "gallery_collections" ADD COLUMN IF NOT EXISTS "portfolio_selection" text DEFAULT 'inherit' NOT NULL;
ALTER TABLE "gallery_collections" ADD COLUMN IF NOT EXISTS "client_visibility" text DEFAULT 'all' NOT NULL;
ALTER TABLE "gallery_photos" ADD COLUMN IF NOT EXISTS "portfolio_selection" text DEFAULT 'inherit' NOT NULL;
ALTER TABLE "creator_business_profiles"
  ADD COLUMN IF NOT EXISTS "vat_registered" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "vat_number" text,
  ADD COLUMN IF NOT EXISTS "deposit_percentage" integer DEFAULT 50 NOT NULL,
  ADD COLUMN IF NOT EXISTS "wht_rate" integer DEFAULT 0 NOT NULL;
