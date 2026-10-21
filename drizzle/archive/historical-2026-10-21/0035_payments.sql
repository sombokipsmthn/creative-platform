CREATE TABLE IF NOT EXISTS "payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "creator_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "invoice_id" uuid NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
  "amount" integer NOT NULL,
  "currency" text NOT NULL,
  "payment_date" timestamp NOT NULL,
  "payment_method" text NOT NULL,
  "transaction_reference" text,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "payments_creator_id_idx" ON "payments" USING btree ("creator_id");
CREATE INDEX IF NOT EXISTS "payments_invoice_id_idx" ON "payments" USING btree ("invoice_id");
CREATE INDEX IF NOT EXISTS "payments_payment_date_idx" ON "payments" USING btree ("payment_date");
