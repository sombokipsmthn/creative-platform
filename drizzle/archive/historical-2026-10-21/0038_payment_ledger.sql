CREATE TABLE IF NOT EXISTS "payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "creator_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "client_id" text NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "invoice_id" uuid NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
  "project_id" uuid REFERENCES "projects"("id") ON DELETE SET NULL,
  "reference" text NOT NULL UNIQUE,
  "amount" integer NOT NULL CHECK ("amount" > 0),
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
CREATE INDEX IF NOT EXISTS "payments_creator_id_idx" ON "payments" USING btree ("creator_id");
CREATE INDEX IF NOT EXISTS "payments_invoice_id_idx" ON "payments" USING btree ("invoice_id");
CREATE INDEX IF NOT EXISTS "payments_client_id_idx" ON "payments" USING btree ("client_id");
CREATE INDEX IF NOT EXISTS "payments_project_id_idx" ON "payments" USING btree ("project_id");
CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments" USING btree ("status");
CREATE INDEX IF NOT EXISTS "payments_paid_at_idx" ON "payments" USING btree ("paid_at");

CREATE TABLE IF NOT EXISTS "payment_schedules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "creator_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "client_id" text NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "invoice_id" uuid NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
  "project_id" uuid REFERENCES "projects"("id") ON DELETE SET NULL,
  "label" text NOT NULL,
  "amount" integer NOT NULL CHECK ("amount" > 0),
  "currency" text NOT NULL,
  "due_date" timestamp NOT NULL,
  "milestone" text,
  "status" text DEFAULT 'scheduled' NOT NULL,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "payment_schedules_creator_id_idx" ON "payment_schedules" USING btree ("creator_id");
CREATE INDEX IF NOT EXISTS "payment_schedules_invoice_id_idx" ON "payment_schedules" USING btree ("invoice_id");
CREATE INDEX IF NOT EXISTS "payment_schedules_due_date_idx" ON "payment_schedules" USING btree ("due_date");

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
CREATE INDEX IF NOT EXISTS "payment_term_amendments_creator_id_idx" ON "payment_term_amendments" USING btree ("creator_id");
CREATE INDEX IF NOT EXISTS "payment_term_amendments_invoice_id_idx" ON "payment_term_amendments" USING btree ("invoice_id");

CREATE TABLE IF NOT EXISTS "payment_audit_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "creator_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "payment_id" uuid NOT NULL REFERENCES "payments"("id") ON DELETE CASCADE,
  "event_type" text NOT NULL,
  "actor_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "payment_audit_events_payment_id_idx" ON "payment_audit_events" USING btree ("payment_id");
CREATE INDEX IF NOT EXISTS "payment_audit_events_creator_id_idx" ON "payment_audit_events" USING btree ("creator_id");
