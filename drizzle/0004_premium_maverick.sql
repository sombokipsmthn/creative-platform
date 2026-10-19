CREATE TABLE "equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"brand" text,
	"description" text,
	"specs" text,
	"daily_rate" integer NOT NULL,
	"image_url" text,
	"available" text DEFAULT 'true' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "clients" CASCADE;--> statement-breakpoint
DROP TABLE "creator_profiles" CASCADE;--> statement-breakpoint
DROP TABLE "invoice_items" CASCADE;--> statement-breakpoint
DROP TABLE "invoices" CASCADE;--> statement-breakpoint
DROP TABLE "projects" CASCADE;--> statement-breakpoint
DROP TABLE "users" CASCADE;