ALTER TABLE "creator_profiles" DROP CONSTRAINT "creator_profiles_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "creator_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "creator_profiles" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "creator_profiles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "creator_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "client_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_users_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("auth_user_id") ON DELETE cascade ON UPDATE no action;