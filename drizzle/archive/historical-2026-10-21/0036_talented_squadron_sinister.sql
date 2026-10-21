CREATE TABLE "calendar_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" text NOT NULL,
	"client_id" text,
	"project_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"location" text,
	"event_type" text DEFAULT 'appointment' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_portfolios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"headline" text,
	"contact_email" text,
	"social_links" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"selected_project_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"layout" text DEFAULT 'editorial' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_portfolios_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" text NOT NULL,
	"project_id" uuid,
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
--> statement-breakpoint
CREATE TABLE "gallery_watermark_presets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" text NOT NULL,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"type" text DEFAULT 'text' NOT NULL,
	"text" text DEFAULT 'KIPSMTHN' NOT NULL,
	"position" text DEFAULT 'bottom-right' NOT NULL,
	"opacity" integer DEFAULT 55 NOT NULL,
	"font_size" integer DEFAULT 42 NOT NULL,
	"image_url" text,
	"image_path" text,
	"image_filename" text,
	"image_mime_type" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_watermark_presets_creator_name_key" UNIQUE("creator_id","name")
);
--> statement-breakpoint
CREATE TABLE "payment_audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" text NOT NULL,
	"payment_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"actor_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" text NOT NULL,
	"client_id" text NOT NULL,
	"invoice_id" uuid NOT NULL,
	"project_id" uuid,
	"label" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text NOT NULL,
	"due_date" timestamp NOT NULL,
	"milestone" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_term_amendments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" text NOT NULL,
	"invoice_id" uuid NOT NULL,
	"previous_terms" text,
	"new_terms" text NOT NULL,
	"agreement_date" timestamp NOT NULL,
	"evidence_reference" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" text NOT NULL,
	"client_id" text NOT NULL,
	"invoice_id" uuid,
	"project_id" uuid,
	"reference" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text NOT NULL,
	"method" text NOT NULL,
	"origin" text DEFAULT 'manual' NOT NULL,
	"status" text DEFAULT 'pending_verification' NOT NULL,
	"paid_at" timestamp NOT NULL,
	"confirmed_at" timestamp,
	"confirmed_by" text,
	"transaction_reference" text,
	"evidence_reference" text,
	"notes" text,
	"reversal_reason" text,
	"related_payment_id" uuid,
	"provider_name" text,
	"external_transaction_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "studio_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" text NOT NULL,
	"client_id" text,
	"project_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"event_type" text DEFAULT 'client_event' NOT NULL,
	"status" text DEFAULT 'planned' NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp,
	"all_day" boolean DEFAULT false NOT NULL,
	"location" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gallery_watermarks" ADD COLUMN "type" text DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_watermarks" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "gallery_watermarks" ADD COLUMN "image_path" text;--> statement-breakpoint
ALTER TABLE "gallery_watermarks" ADD COLUMN "image_filename" text;--> statement-breakpoint
ALTER TABLE "gallery_watermarks" ADD COLUMN "image_mime_type" text;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_portfolios" ADD CONSTRAINT "creator_portfolios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_watermark_presets" ADD CONSTRAINT "gallery_watermark_presets_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_audit_events" ADD CONSTRAINT "payment_audit_events_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_audit_events" ADD CONSTRAINT "payment_audit_events_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_audit_events" ADD CONSTRAINT "payment_audit_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_schedules" ADD CONSTRAINT "payment_schedules_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_schedules" ADD CONSTRAINT "payment_schedules_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_schedules" ADD CONSTRAINT "payment_schedules_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_schedules" ADD CONSTRAINT "payment_schedules_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_term_amendments" ADD CONSTRAINT "payment_term_amendments_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_term_amendments" ADD CONSTRAINT "payment_term_amendments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_confirmed_by_users_id_fk" FOREIGN KEY ("confirmed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_events" ADD CONSTRAINT "studio_events_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_events" ADD CONSTRAINT "studio_events_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_events" ADD CONSTRAINT "studio_events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "calendar_events_creator_id_idx" ON "calendar_events" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "calendar_events_start_date_idx" ON "calendar_events" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "expenses_creator_id_idx" ON "expenses" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "expenses_project_id_idx" ON "expenses" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "expenses_expense_date_idx" ON "expenses" USING btree ("expense_date");--> statement-breakpoint
CREATE INDEX "gallery_watermark_presets_creator_idx" ON "gallery_watermark_presets" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "payment_audit_events_payment_id_idx" ON "payment_audit_events" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "payment_audit_events_creator_id_idx" ON "payment_audit_events" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "payment_schedules_creator_id_idx" ON "payment_schedules" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "payment_schedules_invoice_id_idx" ON "payment_schedules" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "payment_schedules_due_date_idx" ON "payment_schedules" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "payment_term_amendments_creator_id_idx" ON "payment_term_amendments" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "payment_term_amendments_invoice_id_idx" ON "payment_term_amendments" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "payments_creator_id_idx" ON "payments" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "payments_invoice_id_idx" ON "payments" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "payments_client_id_idx" ON "payments" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "payments_project_id_idx" ON "payments" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_paid_at_idx" ON "payments" USING btree ("paid_at");--> statement-breakpoint
CREATE INDEX "studio_events_creator_id_idx" ON "studio_events" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "studio_events_client_id_idx" ON "studio_events" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "studio_events_project_id_idx" ON "studio_events" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "studio_events_starts_at_idx" ON "studio_events" USING btree ("starts_at");