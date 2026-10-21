CREATE TABLE "quote_amendments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"reason" text,
	"requested_by" text,
	"notes" text,
	"previous_subtotal" integer DEFAULT 0 NOT NULL,
	"previous_discount_amount" integer DEFAULT 0 NOT NULL,
	"previous_tax" integer DEFAULT 0 NOT NULL,
	"previous_total" integer DEFAULT 0 NOT NULL,
	"new_subtotal" integer DEFAULT 0 NOT NULL,
	"new_discount_amount" integer DEFAULT 0 NOT NULL,
	"new_tax" integer DEFAULT 0 NOT NULL,
	"new_total" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "discount_type" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "discount_value" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "discount_amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "invoice_id" uuid;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_amendments" ADD CONSTRAINT "quote_amendments_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;