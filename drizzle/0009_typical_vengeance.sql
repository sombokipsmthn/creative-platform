ALTER TABLE "quotes" ADD COLUMN "project_name" text;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "currency" text DEFAULT 'KES' NOT NULL;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "payment_terms" text;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "valid_until" timestamp;