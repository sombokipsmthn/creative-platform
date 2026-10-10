ALTER TABLE "creator_services" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "galleries" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "galleries" ADD COLUMN "expiry_behavior" text DEFAULT 'hide' NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD COLUMN "processing_error" text;--> statement-breakpoint
ALTER TABLE "upload_audit" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "contract_events_contract_id_idx" ON "contract_events" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "contract_templates_creator_id_idx" ON "contract_templates" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "contract_templates_is_system_idx" ON "contract_templates" USING btree ("is_system_template");--> statement-breakpoint
CREATE INDEX "contracts_creator_id_idx" ON "contracts" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "contracts_client_id_idx" ON "contracts" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "contracts_project_id_idx" ON "contracts" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "contracts_quote_id_idx" ON "contracts" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "contracts_template_id_idx" ON "contracts" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "contracts_status_idx" ON "contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contracts_token_idx" ON "contracts" USING btree ("token");--> statement-breakpoint
CREATE INDEX "galleries_creator_id_idx" ON "galleries" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "galleries_client_id_idx" ON "galleries" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "galleries_project_id_idx" ON "galleries" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "galleries_slug_idx" ON "galleries" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "gallery_access_sessions_gallery_idx" ON "gallery_access_sessions" USING btree ("gallery_id");--> statement-breakpoint
CREATE INDEX "gallery_collections_gallery_id_idx" ON "gallery_collections" USING btree ("gallery_id");--> statement-breakpoint
CREATE INDEX "gallery_comments_photo_created_idx" ON "gallery_comments" USING btree ("photo_id","created_at");--> statement-breakpoint
CREATE INDEX "gallery_download_presets_gallery_idx" ON "gallery_download_presets" USING btree ("gallery_id");--> statement-breakpoint
CREATE INDEX "gallery_downloads_gallery_created_idx" ON "gallery_downloads" USING btree ("gallery_id","created_at");--> statement-breakpoint
CREATE INDEX "gallery_downloads_photo_created_idx" ON "gallery_downloads" USING btree ("photo_id","created_at");--> statement-breakpoint
CREATE INDEX "gallery_photo_actions_gallery_idx" ON "gallery_photo_actions" USING btree ("gallery_id");--> statement-breakpoint
CREATE INDEX "gallery_photo_actions_photo_idx" ON "gallery_photo_actions" USING btree ("photo_id");--> statement-breakpoint
CREATE INDEX "gallery_photos_gallery_id_idx" ON "gallery_photos" USING btree ("gallery_id");--> statement-breakpoint
CREATE INDEX "gallery_photos_collection_id_idx" ON "gallery_photos" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "gallery_photos_gallery_collection_sort_idx" ON "gallery_photos" USING btree ("gallery_id","collection_id","sort_order");--> statement-breakpoint
ALTER TABLE "gallery_photo_actions" ADD CONSTRAINT "gallery_photo_actions_session_photo_unique" UNIQUE("session_id","photo_id");