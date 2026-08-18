ALTER TABLE "quote_amendments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "quote_amendments" CASCADE;--> statement-breakpoint
ALTER TABLE "quotes" DROP CONSTRAINT "quotes_invoice_id_invoices_id_fk";
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "quote_id" uuid;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "creator_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;