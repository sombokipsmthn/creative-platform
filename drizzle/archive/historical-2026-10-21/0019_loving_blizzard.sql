CREATE TABLE "contract_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contract_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" text,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"document_type" text NOT NULL,
	"content" text NOT NULL,
	"variables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_system_template" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" text NOT NULL,
	"client_id" text NOT NULL,
	"project_id" uuid,
	"quote_id" uuid,
	"template_id" uuid,
	"title" text NOT NULL,
	"contract_number" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"content" text NOT NULL,
	"currency" text DEFAULT 'KES',
	"total_amount" integer,
	"token" text NOT NULL,
	"expires_at" timestamp,
	"sent_at" timestamp,
	"viewed_at" timestamp,
	"signed_at" timestamp,
	"declined_at" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contracts_contract_number_unique" UNIQUE("contract_number"),
	CONSTRAINT "contracts_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "galleries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" text NOT NULL,
	"client_id" text,
	"project_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"slug" text NOT NULL,
	"access_pin" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"cover_photo_id" uuid,
	"allow_downloads" boolean DEFAULT true NOT NULL,
	"allow_favorites" boolean DEFAULT true NOT NULL,
	"allow_selections" boolean DEFAULT true NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "galleries_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "gallery_access_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gallery_id" uuid NOT NULL,
	"ip_address" text NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp DEFAULT now() NOT NULL,
	"lockout_until" timestamp,
	CONSTRAINT "gallery_access_attempts_gallery_id_ip_address_unique" UNIQUE("gallery_id","ip_address")
);
--> statement-breakpoint
CREATE TABLE "gallery_access_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gallery_id" uuid NOT NULL,
	"client_id" text,
	"token_hash" text NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_access_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "gallery_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gallery_id" uuid NOT NULL,
	"client_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp,
	"responded_at" timestamp,
	"response_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_approvals_gallery_id_unique" UNIQUE("gallery_id")
);
--> statement-breakpoint
CREATE TABLE "gallery_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gallery_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gallery_id" uuid NOT NULL,
	"photo_id" uuid NOT NULL,
	"session_id" uuid,
	"author_type" text DEFAULT 'client' NOT NULL,
	"author_name" text DEFAULT 'Client' NOT NULL,
	"body" text NOT NULL,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_download_presets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gallery_id" uuid NOT NULL,
	"name" text NOT NULL,
	"variant" text DEFAULT 'display' NOT NULL,
	"max_width" integer,
	"quality" integer DEFAULT 90 NOT NULL,
	"format" text DEFAULT 'jpg' NOT NULL,
	"include_watermark" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_downloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gallery_id" uuid NOT NULL,
	"photo_id" uuid,
	"preset_id" uuid,
	"session_id" uuid,
	"download_type" text DEFAULT 'single' NOT NULL,
	"filename" text,
	"bytes" bigint,
	"ip_hash" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_photo_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"gallery_id" uuid NOT NULL,
	"photo_id" uuid NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"is_selected" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gallery_id" uuid NOT NULL,
	"collection_id" uuid,
	"filename" text NOT NULL,
	"original_url" text NOT NULL,
	"display_url" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"storage_path" text,
	"mime_type" text,
	"file_size" bigint,
	"width" integer,
	"height" integer,
	"capture_date" timestamp,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"is_selected" boolean DEFAULT false NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_watermarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gallery_id" uuid NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"text" text DEFAULT 'KIPSMTHN' NOT NULL,
	"position" text DEFAULT 'bottom-right' NOT NULL,
	"opacity" integer DEFAULT 55 NOT NULL,
	"font_size" integer DEFAULT 42 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_watermarks_gallery_id_unique" UNIQUE("gallery_id")
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "contract_events" ADD CONSTRAINT "contract_events_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_templates" ADD CONSTRAINT "contract_templates_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_template_id_contract_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."contract_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_access_attempts" ADD CONSTRAINT "gallery_access_attempts_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_access_sessions" ADD CONSTRAINT "gallery_access_sessions_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_access_sessions" ADD CONSTRAINT "gallery_access_sessions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_approvals" ADD CONSTRAINT "gallery_approvals_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_approvals" ADD CONSTRAINT "gallery_approvals_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_collections" ADD CONSTRAINT "gallery_collections_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_comments" ADD CONSTRAINT "gallery_comments_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_comments" ADD CONSTRAINT "gallery_comments_photo_id_gallery_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."gallery_photos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_comments" ADD CONSTRAINT "gallery_comments_session_id_gallery_access_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."gallery_access_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_download_presets" ADD CONSTRAINT "gallery_download_presets_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_downloads" ADD CONSTRAINT "gallery_downloads_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_downloads" ADD CONSTRAINT "gallery_downloads_photo_id_gallery_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."gallery_photos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_downloads" ADD CONSTRAINT "gallery_downloads_preset_id_gallery_download_presets_id_fk" FOREIGN KEY ("preset_id") REFERENCES "public"."gallery_download_presets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_downloads" ADD CONSTRAINT "gallery_downloads_session_id_gallery_access_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."gallery_access_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_photo_actions" ADD CONSTRAINT "gallery_photo_actions_session_id_gallery_access_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."gallery_access_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_photo_actions" ADD CONSTRAINT "gallery_photo_actions_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_photo_actions" ADD CONSTRAINT "gallery_photo_actions_photo_id_gallery_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."gallery_photos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_collection_id_gallery_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."gallery_collections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_watermarks" ADD CONSTRAINT "gallery_watermarks_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number");