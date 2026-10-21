DROP TABLE "creator_business_profiles" CASCADE;--> statement-breakpoint
DROP TABLE "creator_services" CASCADE;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "feedback_status" text DEFAULT 'AWAITING_FEEDBACK' NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "contract_status" text DEFAULT 'NOT_SENT' NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "etims_invoice_status" text DEFAULT 'NOT_SENT' NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "tax_certificate_status" text DEFAULT 'NOT_RECEIVED' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "onboarding_status";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "onboarding_step";