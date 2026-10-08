CREATE TABLE "project_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"creator_id" text NOT NULL,
	"filename" text NOT NULL,
	"original_url" text NOT NULL,
	"display_url" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"storage_path" text,
	"original_path" text,
	"display_path" text,
	"thumbnail_path" text,
	"watermark_path" text,
	"processing_status" text DEFAULT 'ready' NOT NULL,
	"processing_error" text,
	"mime_type" text,
	"file_size" bigint,
	"width" integer,
	"height" integer,
	"alt_text" text,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"is_cover" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "short_description" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "year" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "services" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "disciplines" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "collaborators" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "story_overview" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "story_challenge" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "story_approach" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "story_outcome" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "story_credits" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "visibility" text DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "cover_media_id" uuid;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_media_project_id_idx" ON "project_media" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_media_creator_id_idx" ON "project_media" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "project_media_project_sort_idx" ON "project_media" USING btree ("project_id","sort_order");--> statement-breakpoint
CREATE INDEX "projects_creator_id_idx" ON "projects" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "projects_client_id_idx" ON "projects" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "projects_featured_idx" ON "projects" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "projects_published_at_idx" ON "projects" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "projects_visibility_idx" ON "projects" USING btree ("visibility");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_slug_unique" UNIQUE("slug");