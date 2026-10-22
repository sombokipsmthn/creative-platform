ALTER TABLE "quotes" ADD COLUMN "quote_number" text;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "production_days" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "client_contact" text;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "deposit_percentage" integer DEFAULT 50;