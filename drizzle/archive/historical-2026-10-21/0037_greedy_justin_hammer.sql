CREATE TABLE "creator_email_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"invitation_subject" text DEFAULT 'Your Private Client Gallery is Ready — KIPSMTHN' NOT NULL,
	"invitation_body" text DEFAULT 'Hello {ClientName},

Your private gallery "{GalleryTitle}" is now live on KIPSMTHN.

Use your access PIN: {PIN} to view, favorite, and download your deliverables.

Best regards,
{CreatorName}' NOT NULL,
	"reminder_subject" text DEFAULT 'Reminder: Your gallery "{GalleryTitle}" expires in {DaysRemaining} days' NOT NULL,
	"reminder_body" text DEFAULT 'Hello {ClientName},

This is a friendly reminder that your access to "{GalleryTitle}" will expire on {ExpiryDate}.

Visit the gallery to make your final selections and downloads.

Best regards,
{CreatorName}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_email_templates_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "creator_gallery_defaults" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"default_photo_selection_limit" integer DEFAULT 25 NOT NULL,
	"default_expiration_days" integer DEFAULT 60 NOT NULL,
	"default_master_pin" text DEFAULT '4821' NOT NULL,
	"default_allow_downloads" boolean DEFAULT true NOT NULL,
	"default_allow_favorites" boolean DEFAULT true NOT NULL,
	"default_allow_selections" boolean DEFAULT true NOT NULL,
	"default_require_pin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_gallery_defaults_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "creator_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"integration_key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'inactive' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"connected_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_integrations_user_key_unique" UNIQUE("user_id","integration_key")
);
--> statement-breakpoint
CREATE TABLE "creator_notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"gallery_selections" boolean DEFAULT true NOT NULL,
	"gallery_comments" boolean DEFAULT true NOT NULL,
	"gallery_shares" boolean DEFAULT true NOT NULL,
	"gallery_approvals" boolean DEFAULT true NOT NULL,
	"contract_signed" boolean DEFAULT true NOT NULL,
	"contract_viewed" boolean DEFAULT true NOT NULL,
	"contract_declined" boolean DEFAULT true NOT NULL,
	"invoice_paid" boolean DEFAULT true NOT NULL,
	"invoice_overdue" boolean DEFAULT true NOT NULL,
	"payment_received" boolean DEFAULT true NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"in_app_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "creator_workspace_branding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"custom_domain" text,
	"hide_platform_branding" boolean DEFAULT true NOT NULL,
	"header_logo_url" text,
	"favicon_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_workspace_branding_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "creator_email_templates" ADD CONSTRAINT "creator_email_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_gallery_defaults" ADD CONSTRAINT "creator_gallery_defaults_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_integrations" ADD CONSTRAINT "creator_integrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_notification_preferences" ADD CONSTRAINT "creator_notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_workspace_branding" ADD CONSTRAINT "creator_workspace_branding_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;