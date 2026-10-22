CREATE TABLE "gallery_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gallery_id" uuid NOT NULL,
	"session_id" uuid,
	"photo_id" uuid,
	"collection_id" uuid,
	"event_type" text NOT NULL,
	"client_name" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gallery_id" uuid NOT NULL,
	"name" text DEFAULT 'Default' NOT NULL,
	"type" text DEFAULT 'preset' NOT NULL,
	"layout" text DEFAULT 'masonry' NOT NULL,
	"accent_color" text DEFAULT '#000000' NOT NULL,
	"background_color" text DEFAULT '#ffffff' NOT NULL,
	"text_color" text DEFAULT '#000000' NOT NULL,
	"border_radius" integer DEFAULT 0 NOT NULL,
	"show_title" boolean DEFAULT true NOT NULL,
	"show_description" boolean DEFAULT true NOT NULL,
	"show_collections" boolean DEFAULT true NOT NULL,
	"masonry_columns" integer DEFAULT 4 NOT NULL,
	"aspect_ratio" text DEFAULT 'auto' NOT NULL,
	"custom_css" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_themes_gallery_id_unique" UNIQUE("gallery_id")
);
--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "signer_name" text;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "signer_email" text;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "signed_ip" text;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "signed_user_agent" text;--> statement-breakpoint
ALTER TABLE "galleries" ADD COLUMN "focal_point" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD COLUMN "original_path" text;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD COLUMN "display_path" text;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD COLUMN "thumbnail_path" text;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD COLUMN "watermark_path" text;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD COLUMN "processing_status" text DEFAULT 'ready' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "scope_of_work" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "deliverables" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "total_amount" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "currency" text DEFAULT 'KES';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "payment_terms" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "revisions_policy" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "licensing_terms" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "notice_period" text;--> statement-breakpoint
ALTER TABLE "gallery_activity" ADD CONSTRAINT "gallery_activity_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_activity" ADD CONSTRAINT "gallery_activity_session_id_gallery_access_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."gallery_access_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_activity" ADD CONSTRAINT "gallery_activity_photo_id_gallery_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."gallery_photos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_activity" ADD CONSTRAINT "gallery_activity_collection_id_gallery_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."gallery_collections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_themes" ADD CONSTRAINT "gallery_themes_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;