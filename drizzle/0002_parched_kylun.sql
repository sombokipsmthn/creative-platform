ALTER TABLE "galleries" ADD COLUMN "portfolio_publish_mode" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_collections" ADD COLUMN "portfolio_selection" text DEFAULT 'inherit' NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_collections" ADD COLUMN "client_visibility" text DEFAULT 'all' NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD COLUMN "portfolio_selection" text DEFAULT 'inherit' NOT NULL;