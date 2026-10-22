-- Forward-only repair for schema objects used by the creator APIs.
-- Additive and safe for existing creator data.

ALTER TABLE "clients"
  ADD COLUMN IF NOT EXISTS "location" text,
  ADD COLUMN IF NOT EXISTS "feedback_status" text NOT NULL DEFAULT 'AWAITING_FEEDBACK',
  ADD COLUMN IF NOT EXISTS "contract_status" text NOT NULL DEFAULT 'NOT_SENT',
  ADD COLUMN IF NOT EXISTS "etims_invoice_status" text NOT NULL DEFAULT 'NOT_SENT',
  ADD COLUMN IF NOT EXISTS "tax_certificate_status" text NOT NULL DEFAULT 'NOT_RECEIVED';

CREATE TABLE IF NOT EXISTS "galleries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "creator_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "client_id" text REFERENCES "clients"("id") ON DELETE SET NULL,
  "project_id" uuid,
  "title" text NOT NULL,
  "description" text,
  "category" text,
  "slug" text NOT NULL,
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
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "galleries_slug_unique" UNIQUE ("slug")
);

CREATE INDEX IF NOT EXISTS "galleries_creator_id_idx"
  ON "galleries" ("creator_id");
CREATE INDEX IF NOT EXISTS "galleries_client_id_idx"
  ON "galleries" ("client_id");
CREATE INDEX IF NOT EXISTS "galleries_project_id_idx"
  ON "galleries" ("project_id");
CREATE INDEX IF NOT EXISTS "galleries_slug_idx"
  ON "galleries" ("slug");

CREATE TABLE IF NOT EXISTS "contract_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "creator_id" text REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "description" text,
  "category" text NOT NULL,
  "document_type" text NOT NULL,
  "content" text NOT NULL,
  "variables" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "is_system_template" boolean NOT NULL DEFAULT false,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "contract_templates_creator_id_idx"
  ON "contract_templates" ("creator_id");
CREATE INDEX IF NOT EXISTS "contract_templates_is_system_idx"
  ON "contract_templates" ("is_system_template");

CREATE TABLE IF NOT EXISTS "contracts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "creator_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "client_id" text NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  -- projects.id is text in the live database, so no incompatible FK is added.
  "project_id" uuid,
  "quote_id" uuid REFERENCES "quotes"("id") ON DELETE SET NULL,
  "template_id" uuid REFERENCES "contract_templates"("id") ON DELETE SET NULL,
  "title" text NOT NULL,
  "contract_number" text NOT NULL,
  "status" text NOT NULL DEFAULT 'draft',
  "content" text NOT NULL,
  "currency" text DEFAULT 'KES',
  "total_amount" integer,
  "token" text NOT NULL,
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
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "contracts_contract_number_unique" UNIQUE ("contract_number"),
  CONSTRAINT "contracts_token_unique" UNIQUE ("token")
);

CREATE INDEX IF NOT EXISTS "contracts_creator_id_idx"
  ON "contracts" ("creator_id");
CREATE INDEX IF NOT EXISTS "contracts_client_id_idx"
  ON "contracts" ("client_id");
CREATE INDEX IF NOT EXISTS "contracts_project_id_idx"
  ON "contracts" ("project_id");
CREATE INDEX IF NOT EXISTS "contracts_quote_id_idx"
  ON "contracts" ("quote_id");
CREATE INDEX IF NOT EXISTS "contracts_template_id_idx"
  ON "contracts" ("template_id");
CREATE INDEX IF NOT EXISTS "contracts_status_idx"
  ON "contracts" ("status");
CREATE INDEX IF NOT EXISTS "contracts_token_idx"
  ON "contracts" ("token");