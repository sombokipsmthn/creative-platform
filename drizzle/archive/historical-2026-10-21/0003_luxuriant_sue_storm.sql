ALTER TABLE "creator_profiles" DROP CONSTRAINT "creator_profiles_user_id_users_auth_user_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_client_id_clients_id_fk";
--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "creator_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "creator_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "client_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "creator_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "client_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_profiles" DROP COLUMN "display_name";--> statement-breakpoint
ALTER TABLE "creator_profiles" DROP COLUMN "headline";--> statement-breakpoint
ALTER TABLE "creator_profiles" DROP COLUMN "instagram_url";--> statement-breakpoint
ALTER TABLE "creator_profiles" DROP COLUMN "linkedin_url";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "slug";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "start_date";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "end_date";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "featured";