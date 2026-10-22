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
CREATE INDEX IF NOT EXISTS "expenses_creator_id_idx" ON "expenses" USING btree ("creator_id");
CREATE INDEX IF NOT EXISTS "expenses_project_id_idx" ON "expenses" USING btree ("project_id");
CREATE INDEX IF NOT EXISTS "expenses_expense_date_idx" ON "expenses" USING btree ("expense_date");
