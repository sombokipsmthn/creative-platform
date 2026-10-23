import { pgTable, foreignKey, unique, uuid, text, boolean, timestamp, integer, bigint, index, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const galleries = pgTable("galleries", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	creatorId: text("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	clientId: text("client_id"),
	projectId: uuid("project_id"),
	title: text().notNull(),
	description: text(),
	category: text(),
	slug: text().notNull(),
	accessPin: text("access_pin"),
	status: text().default('draft').notNull(),
	coverPhotoId: uuid("cover_photo_id"),
	allowDownloads: boolean("allow_downloads").default(true).notNull(),
	allowFavorites: boolean("allow_favorites").default(true).notNull(),
	allowSelections: boolean("allow_selections").default(true).notNull(),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "galleries_creator_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "galleries_client_id_clients_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "galleries_project_id_projects_id_fk"
		}).onDelete("set null"),
	unique("galleries_slug_unique").on(table.slug),
]);

export const creatorBusinessProfiles = pgTable("creator_business_profiles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	businessName: text("business_name"),
	phone: text(),
	kraPin: text("kra_pin"),
	vatRegistered: boolean("vat_registered").default(false).notNull(),
	vatNumber: text("vat_number"),
	currency: text().default('KES').notNull(),
	depositPercentage: integer("deposit_percentage").default(50).notNull(),
	whtRate: integer("wht_rate").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "creator_business_profiles_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("creator_business_profiles_user_id_unique").on(table.userId),
]);

export const creatorServices = pgTable("creator_services", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	creatorId: text("creator_id").notNull(),
	name: text().notNull(),
	description: text(),
	category: text(),
	defaultRate: integer("default_rate").default(0).notNull(),
	currency: text().default('KES').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "creator_services_creator_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const galleryCollections = pgTable("gallery_collections", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	galleryId: uuid("gallery_id").notNull(),
	title: text().notNull(),
	description: text(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.galleryId],
			foreignColumns: [galleries.id],
			name: "gallery_collections_gallery_id_galleries_id_fk"
		}).onDelete("cascade"),
]);

export const galleryPhotos = pgTable("gallery_photos", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	galleryId: uuid("gallery_id").notNull(),
	collectionId: uuid("collection_id"),
	filename: text().notNull(),
	originalUrl: text("original_url").notNull(),
	displayUrl: text("display_url").notNull(),
	thumbnailUrl: text("thumbnail_url").notNull(),
	storagePath: text("storage_path"),
	mimeType: text("mime_type"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	fileSize: bigint("file_size", { mode: "number" }),
	width: integer(),
	height: integer(),
	captureDate: timestamp("capture_date", { mode: 'string' }),
	sortOrder: integer("sort_order").default(0).notNull(),
	isHidden: boolean("is_hidden").default(false).notNull(),
	isFavorite: boolean("is_favorite").default(false).notNull(),
	isSelected: boolean("is_selected").default(false).notNull(),
	downloadCount: integer("download_count").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.galleryId],
			foreignColumns: [galleries.id],
			name: "gallery_photos_gallery_id_galleries_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.collectionId],
			foreignColumns: [galleryCollections.id],
			name: "gallery_photos_collection_id_gallery_collections_id_fk"
		}).onDelete("set null"),
]);

export const clients = pgTable("clients", {
	id: text().primaryKey().notNull(),
	creatorId: text("creator_id").notNull(),
	name: text().notNull(),
	company: text(),
	email: text(),
	phone: text(),
	website: text(),
	notes: text(),
	status: text().default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	location: text(),
	feedbackStatus: text("feedback_status").default('AWAITING_FEEDBACK').notNull(),
	contractStatus: text("contract_status").default('NOT_SENT').notNull(),
	etimsInvoiceStatus: text("etims_invoice_status").default('NOT_SENT').notNull(),
	taxCertificateStatus: text("tax_certificate_status").default('NOT_RECEIVED').notNull(),
	kraPin: text("kra_pin"),
}, (table) => [
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "clients_creator_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const creatorProfiles = pgTable("creator_profiles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	bio: text(),
	avatarUrl: text("avatar_url"),
	website: text(),
	location: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "creator_profiles_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("creator_profiles_user_id_unique").on(table.userId),
]);

export const invoices = pgTable("invoices", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	creatorId: text("creator_id").notNull(),
	clientId: text("client_id").notNull(),
	quoteId: uuid("quote_id"),
	invoiceNumber: text("invoice_number").notNull(),
	title: text().default('Invoice').notNull(),
	status: text().default('draft').notNull(),
	issueDate: timestamp("issue_date", { mode: 'string' }).defaultNow().notNull(),
	dueDate: timestamp("due_date", { mode: 'string' }),
	notes: text(),
	subtotal: integer().default(0).notNull(),
	tax: integer().default(0).notNull(),
	total: integer().default(0).notNull(),
	currency: text().default('USD').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "invoices_creator_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "invoices_client_id_clients_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quotes.id],
			name: "invoices_quote_id_quotes_id_fk"
		}).onDelete("set null"),
]);

export const quotes = pgTable("quotes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	creatorId: text("creator_id").notNull(),
	clientId: text("client_id"),
	projectName: text("project_name"),
	title: text().notNull(),
	status: text().default('draft').notNull(),
	subtotal: integer().default(0).notNull(),
	discountType: text("discount_type").default('none').notNull(),
	discountValue: integer("discount_value").default(0).notNull(),
	discountAmount: integer("discount_amount").default(0).notNull(),
	tax: integer().default(0).notNull(),
	total: integer().default(0).notNull(),
	currency: text().default('KES').notNull(),
	paymentTerms: text("payment_terms"),
	validUntil: timestamp("valid_until", { mode: 'string' }),
	quoteNumber: text("quote_number"),
	productionDays: integer("production_days").default(1),
	location: text(),
	clientContact: text("client_contact"),
	depositPercentage: integer("deposit_percentage").default(50),
	notes: text(),
	invoiceId: uuid("invoice_id"),
	version: integer().default(1).notNull(),
	archivedAt: timestamp("archived_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "quotes_creator_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "quotes_client_id_clients_id_fk"
		}).onDelete("cascade"),
]);

export const projects = pgTable("projects", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	creatorId: text("creator_id").notNull(),
	clientId: text("client_id"),
	name: text().notNull(),
	description: text(),
	status: text().default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "projects_creator_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "projects_client_id_clients_id_fk"
		}).onDelete("cascade"),
]);

export const quoteItems = pgTable("quote_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	quoteId: uuid("quote_id").notNull(),
	category: text().notNull(),
	description: text().notNull(),
	quantity: integer().default(1).notNull(),
	unit: text().default('unit').notNull(),
	rate: integer().default(0).notNull(),
	amount: integer().default(0).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quotes.id],
			name: "quote_items_quote_id_quotes_id_fk"
		}).onDelete("cascade"),
]);

export const equipment = pgTable("equipment", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	dailyRate: integer("daily_rate").notNull(),
	category: text().notNull(),
	subcategory: text(),
	brand: text(),
	specs: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	imageUrl: text("image_url"),
});

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	authUserId: text("auth_user_id").notNull(),
	email: text().notNull(),
	name: text().notNull(),
	handle: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	onboardingStatus: text("onboarding_status").default('incomplete').notNull(),
	onboardingStep: integer("onboarding_step").default(1).notNull(),
}, (table) => [
	unique("users_auth_user_id_unique").on(table.authUserId),
	unique("users_email_unique").on(table.email),
	unique("users_handle_unique").on(table.handle),
]);

export const invoiceItems = pgTable("invoice_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	invoiceId: uuid("invoice_id").notNull(),
	description: text().notNull(),
	quantity: integer().default(1).notNull(),
	unitPrice: integer("unit_price").default(0).notNull(),
	amount: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.invoiceId],
			foreignColumns: [invoices.id],
			name: "invoice_items_invoice_id_invoices_id_fk"
		}).onDelete("cascade"),
]);

export const contractTemplates = pgTable("contract_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	creatorId: text("creator_id"),
	name: text().notNull(),
	description: text(),
	category: text().notNull(),
	documentType: text("document_type").notNull(),
	content: text().notNull(),
	variables: jsonb().default([]).notNull(),
	isSystemTemplate: boolean("is_system_template").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("contract_templates_creator_id_idx").using("btree", table.creatorId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "contract_templates_creator_id_fkey"
		}).onDelete("cascade"),
]);

export const contractEvents = pgTable("contract_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	contractId: uuid("contract_id").notNull(),
	eventType: text("event_type").notNull(),
	metadata: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("contract_events_contract_id_idx").using("btree", table.contractId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.contractId],
			foreignColumns: [contracts.id],
			name: "contract_events_contract_id_fkey"
		}).onDelete("cascade"),
]);

export const contracts = pgTable("contracts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	creatorId: text("creator_id").notNull(),
	clientId: text("client_id").notNull(),
	projectId: uuid("project_id"),
	quoteId: uuid("quote_id"),
	templateId: uuid("template_id"),
	title: text().notNull(),
	contractNumber: text("contract_number").notNull(),
	status: text().default('draft').notNull(),
	content: text().notNull(),
	currency: text().default('KES'),
	totalAmount: integer("total_amount"),
	token: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	sentAt: timestamp("sent_at", { mode: 'string' }),
	viewedAt: timestamp("viewed_at", { mode: 'string' }),
	signedAt: timestamp("signed_at", { mode: 'string' }),
	declinedAt: timestamp("declined_at", { mode: 'string' }),
	cancelledAt: timestamp("cancelled_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	signerName: text("signer_name"),
	signerEmail: text("signer_email"),
	signedIp: text("signed_ip"),
	signedUserAgent: text("signed_user_agent"),
}, (table) => [
	index("contracts_creator_id_idx").using("btree", table.creatorId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "contracts_creator_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "contracts_client_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "contracts_project_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quotes.id],
			name: "contracts_quote_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [contractTemplates.id],
			name: "contracts_template_id_fkey"
		}).onDelete("set null"),
	unique("contracts_contract_number_key").on(table.contractNumber),
	unique("contracts_token_key").on(table.token),
]);

export const galleryAccessSessions = pgTable("gallery_access_sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	galleryId: uuid("gallery_id").notNull(),
	clientId: text("client_id"),
	tokenHash: text("token_hash").notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	lastSeenAt: timestamp("last_seen_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("gallery_access_sessions_gallery_idx").using("btree", table.galleryId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.galleryId],
			foreignColumns: [galleries.id],
			name: "gallery_access_sessions_gallery_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "gallery_access_sessions_client_id_fkey"
		}).onDelete("set null"),
	unique("gallery_access_sessions_token_hash_key").on(table.tokenHash),
]);

export const galleryPhotoActions = pgTable("gallery_photo_actions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sessionId: uuid("session_id").notNull(),
	galleryId: uuid("gallery_id").notNull(),
	photoId: uuid("photo_id").notNull(),
	isFavorite: boolean("is_favorite").default(false).notNull(),
	isSelected: boolean("is_selected").default(false).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("gallery_photo_actions_gallery_idx").using("btree", table.galleryId.asc().nullsLast().op("uuid_ops")),
	index("gallery_photo_actions_photo_idx").using("btree", table.photoId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [galleryAccessSessions.id],
			name: "gallery_photo_actions_session_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.galleryId],
			foreignColumns: [galleries.id],
			name: "gallery_photo_actions_gallery_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.photoId],
			foreignColumns: [galleryPhotos.id],
			name: "gallery_photo_actions_photo_id_fkey"
		}).onDelete("cascade"),
	unique("gallery_photo_actions_session_id_photo_id_key").on(table.photoId, table.sessionId),
]);

export const galleryComments = pgTable("gallery_comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	galleryId: uuid("gallery_id").notNull(),
	photoId: uuid("photo_id").notNull(),
	sessionId: uuid("session_id"),
	authorType: text("author_type").default('client').notNull(),
	authorName: text("author_name").default('Client').notNull(),
	body: text().notNull(),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("gallery_comments_photo_idx").using("btree", table.photoId.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.galleryId],
			foreignColumns: [galleries.id],
			name: "gallery_comments_gallery_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.photoId],
			foreignColumns: [galleryPhotos.id],
			name: "gallery_comments_photo_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [galleryAccessSessions.id],
			name: "gallery_comments_session_id_fkey"
		}).onDelete("set null"),
]);

export const galleryApprovals = pgTable("gallery_approvals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	galleryId: uuid("gallery_id").notNull(),
	clientId: text("client_id"),
	status: text().default('pending').notNull(),
	requestedAt: timestamp("requested_at", { mode: 'string' }),
	respondedAt: timestamp("responded_at", { mode: 'string' }),
	responseNote: text("response_note"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.galleryId],
			foreignColumns: [galleries.id],
			name: "gallery_approvals_gallery_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "gallery_approvals_client_id_fkey"
		}).onDelete("set null"),
	unique("gallery_approvals_gallery_id_key").on(table.galleryId),
]);

export const galleryWatermarks = pgTable("gallery_watermarks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	galleryId: uuid("gallery_id").notNull(),
	enabled: boolean().default(true).notNull(),
	type: text().default('text').notNull(),
	text: text().default('KIPSMTHN').notNull(),
	position: text().default('bottom-right').notNull(),
	opacity: integer().default(55).notNull(),
	fontSize: integer("font_size").default(42).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.galleryId],
			foreignColumns: [galleries.id],
			name: "gallery_watermarks_gallery_id_fkey"
		}).onDelete("cascade"),
	unique("gallery_watermarks_gallery_id_key").on(table.galleryId),
]);

export const galleryWatermarkPresets = pgTable("gallery_watermark_presets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	creatorId: text("creator_id").notNull(),
	name: text().notNull(),
	enabled: boolean().default(true).notNull(),
	type: text().default('text').notNull(),
	text: text().default('KIPSMTHN').notNull(),
	position: text().default('bottom-right').notNull(),
	opacity: integer().default(55).notNull(),
	fontSize: integer("font_size").default(42).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("gallery_watermark_presets_creator_idx").using("btree", table.creatorId.asc().nullsLast().op("text_ops")),
	unique("gallery_watermark_presets_creator_name_key").on(table.creatorId, table.name),
]);
export const galleryDownloadPresets = pgTable("gallery_download_presets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	galleryId: uuid("gallery_id").notNull(),
	name: text().notNull(),
	variant: text().default('display').notNull(),
	maxWidth: integer("max_width"),
	quality: integer().default(90).notNull(),
	format: text().default('jpg').notNull(),
	includeWatermark: boolean("include_watermark").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("gallery_download_presets_gallery_idx").using("btree", table.galleryId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.galleryId],
			foreignColumns: [galleries.id],
			name: "gallery_download_presets_gallery_id_fkey"
		}).onDelete("cascade"),
]);


export const galleryDownloads = pgTable("gallery_downloads", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	galleryId: uuid("gallery_id").notNull(),
	photoId: uuid("photo_id"),
	presetId: uuid("preset_id"),
	sessionId: uuid("session_id"),
	downloadType: text("download_type").default('single').notNull(),
	filename: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	bytes: bigint({ mode: "number" }),
	ipHash: text("ip_hash"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("gallery_downloads_gallery_idx").using("btree", table.galleryId.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("uuid_ops")),
	index("gallery_downloads_photo_idx").using("btree", table.photoId.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.galleryId],
			foreignColumns: [galleries.id],
			name: "gallery_downloads_gallery_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.photoId],
			foreignColumns: [galleryPhotos.id],
			name: "gallery_downloads_photo_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.presetId],
			foreignColumns: [galleryDownloadPresets.id],
			name: "gallery_downloads_preset_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [galleryAccessSessions.id],
			name: "gallery_downloads_session_id_fkey"
		}).onDelete("set null"),
]);

export const galleryThemes = pgTable("gallery_themes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	galleryId: uuid("gallery_id").notNull(),
	name: text().default('Default').notNull(),
	type: text().default('preset').notNull(),
	layout: text().default('masonry').notNull(),
	accentColor: text("accent_color").default('#000000').notNull(),
	backgroundColor: text("background_color").default('#ffffff').notNull(),
	textColor: text("text_color").default('#000000').notNull(),
	borderRadius: integer("border_radius").default(0).notNull(),
	showTitle: boolean("show_title").default(true).notNull(),
	showDescription: boolean("show_description").default(true).notNull(),
	showCollections: boolean("show_collections").default(true).notNull(),
	masonryColumns: integer("masonry_columns").default(4).notNull(),
	aspectRatio: text("aspect_ratio").default('auto').notNull(),
	customCss: text("custom_css"),
	fontFamily: text("font_family").default('sans').notNull(),
	coverStyle: text("cover_style").default('image').notNull(),
	coverFocalX: integer("cover_focal_x").default(50).notNull(),
	coverFocalY: integer("cover_focal_y").default(50).notNull(),
	coverOverlayOpacity: integer("cover_overlay_opacity").default(25).notNull(),
	gridStyle: text("grid_style").default('masonry').notNull(),
	thumbnailSize: text("thumbnail_size").default('regular').notNull(),
	gridSpacing: text("grid_spacing").default('regular').notNull(),
	navigationStyle: text("navigation_style").default('icons-and-text').notNull(),
	showLogo: boolean("show_logo").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("gallery_themes_gallery_id_key").on(table.galleryId),
]);

export const creatorWorkspaceBranding = pgTable("creator_workspace_branding", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  customDomain: text("custom_domain"),
  hidePlatformBranding: boolean("hide_platform_branding").default(true).notNull(),
  headerLogoUrl: text("header_logo_url"),
  faviconUrl: text("favicon_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creatorEmailTemplates = pgTable("creator_email_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  invitationSubject: text("invitation_subject").default('Your Private Client Gallery is Ready — KIPSMTHN').notNull(),
  invitationBody: text("invitation_body").default('Hello {ClientName},\n\nYour private gallery "{GalleryTitle}" is now live on KIPSMTHN.\n\nUse your access PIN: {PIN} to view, favorite, and download your deliverables.\n\nBest regards,\n{CreatorName}').notNull(),
  reminderSubject: text("reminder_subject").default('Reminder: Your gallery "{GalleryTitle}" expires in {DaysRemaining} days').notNull(),
  reminderBody: text("reminder_body").default('Hello {ClientName},\n\nThis is a friendly reminder that your access to "{GalleryTitle}" will expire on {ExpiryDate}.\n\nVisit the gallery to make your final selections and downloads.\n\nBest regards,\n{CreatorName}').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creatorNotificationPreferences = pgTable("creator_notification_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  gallerySelections: boolean("gallery_selections").default(true).notNull(),
  galleryComments: boolean("gallery_comments").default(true).notNull(),
  galleryShares: boolean("gallery_shares").default(true).notNull(),
  galleryApprovals: boolean("gallery_approvals").default(true).notNull(),
  contractSigned: boolean("contract_signed").default(true).notNull(),
  contractViewed: boolean("contract_viewed").default(true).notNull(),
  contractDeclined: boolean("contract_declined").default(true).notNull(),
  invoicePaid: boolean("invoice_paid").default(true).notNull(),
  invoiceOverdue: boolean("invoice_overdue").default(true).notNull(),
  paymentReceived: boolean("payment_received").default(true).notNull(),
  emailEnabled: boolean("email_enabled").default(true).notNull(),
  inAppEnabled: boolean("in_app_enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creatorIntegrations = pgTable("creator_integrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  integrationKey: text("integration_key").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default('inactive').notNull(),
  config: jsonb("config").default({}).notNull(),
  connectedAt: timestamp("connected_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userKeyUnique: unique("creator_integrations_user_key_unique").on(table.userId, table.integrationKey),
}));

export const creatorGalleryDefaults = pgTable("creator_gallery_defaults", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  defaultPhotoSelectionLimit: integer("default_photo_selection_limit").default(25).notNull(),
  defaultExpirationDays: integer("default_expiration_days").default(60).notNull(),
  defaultMasterPin: text("default_master_pin").default('4821').notNull(),
  defaultAllowDownloads: boolean("default_allow_downloads").default(true).notNull(),
  defaultAllowFavorites: boolean("default_allow_favorites").default(true).notNull(),
  defaultAllowSelections: boolean("default_allow_selections").default(true).notNull(),
  defaultRequirePin: boolean("default_require_pin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
