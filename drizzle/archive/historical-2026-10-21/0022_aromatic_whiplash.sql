ALTER TABLE "gallery_themes" ADD COLUMN "show_logo" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_themes" ADD COLUMN "font_family" text DEFAULT 'sans' NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_themes" ADD COLUMN "cover_style" text DEFAULT 'image' NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_themes" ADD COLUMN "cover_focal_x" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_themes" ADD COLUMN "cover_focal_y" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_themes" ADD COLUMN "cover_overlay_opacity" integer DEFAULT 25 NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_themes" ADD COLUMN "grid_style" text DEFAULT 'masonry' NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_themes" ADD COLUMN "thumbnail_size" text DEFAULT 'regular' NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_themes" ADD COLUMN "grid_spacing" text DEFAULT 'regular' NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_themes" ADD COLUMN "navigation_style" text DEFAULT 'icons-and-text' NOT NULL;