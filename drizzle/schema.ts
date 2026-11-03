import { pgTable, index, foreignKey, unique, uuid, text, boolean, integer, timestamp, jsonb, bigint, check } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const galleryWatermarkPresets = pgTable("gallery_watermark_presets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	creatorId: text("creator_id").notNull(),
	name: text().notNull(),
	enabled: boolean().default(true).notNull(),
	text: text().default('KIPSMTHN').notNull(),
	position: text().default('bottom-right').notNull(),
	opacity: integer().default(55).notNull(),
	fontSize: integer("font_size").default(42).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	type: text().default('text').notNull(),
	imageUrl: text("image_url"),
	imagePath: text("image_path"),
	imageFilename: text("image_filename"),
	imageMimeType: text("image_mime_type"),
}, (table) => [
	index("gallery_watermark_presets_creator_idx").using("btree", table.creatorId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "gallery_watermark_presets_creator_id_fkey"
		}).onDelete("cascade"),
	unique("gallery_watermark_presets_creator_name_key").on(table.creatorId, table.name),
]);

export const videoProcessingQueue = pgTable("video_processing_queue", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	photoId: uuid("photo_id").notNull(),
	galleryId: uuid("gallery_id").notNull(),
	creatorId: text("creator_id").notNull(),
	status: text().default('pending').notNull(),
	attempts: integer().default(0).notNull(),
	error: text(),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("video_processing_queue_creator_idx").using("btree", table.creatorId.asc().nullsLast().op("text_ops")),
	index("video_processing_queue_gallery_idx").using("btree", table.galleryId.asc().nullsLast().op("uuid_ops")),
	index("video_processing_queue_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "video_processing_queue_creator_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.galleryId],
			foreignColumns: [galleries.id],
			name: "video_processing_queue_gallery_id_galleries_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.photoId],
			foreignColumns: [galleryPhotos.id],
			name: "video_processing_queue_photo_id_gallery_photos_id_fk"
		}).onDelete("cascade"),
	unique("video_processing_queue_photo_id_unique").on(table.photoId),
]);

export const galleries = pgTable("galleries", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	creatorId: text("creator_id").notNull(),
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
	focalPoint: jsonb("focal_point").default({}),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	expiryBehavior: text("expiry_behavior").default('hide').notNull(),
	portfolioPublishMode: text("portfolio_publish_mode").default('none').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "galleries_client_id_clients_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "galleries_creator_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "galleries_project_id_projects_id_fk"
		}).onDelete("set null"),
	unique("galleries_slug_unique").on(table.slug),
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
	isActive: boolean("is_active").default(true).notNull(),
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
	portfolioSelection: text("portfolio_selection").default('inherit').notNull(),
	clientVisibility: text("client_visibility").default('all').notNull(),
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
	originalPath: text("original_path"),
	displayPath: text("display_path"),
	thumbnailPath: text("thumbnail_path"),
	watermarkPath: text("watermark_path"),
	processingStatus: text("processing_status").default('ready').notNull(),
	processingError: text("processing_error"),
	altText: text("alt_text").default('').notNull(),
	caption: text("caption").default('').notNull(),
	isCover: boolean("is_cover").default(false).notNull(),
	portfolioSelection: text("portfolio_selection").default('inherit').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.collectionId],
			foreignColumns: [galleryCollections.id],
			name: "gallery_photos_collection_id_gallery_collections_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.galleryId],
			foreignColumns: [galleries.id],
			name: "gallery_photos_gallery_id_galleries_id_fk"
		}).onDelete("cascade"),
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

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	authUserId: text("auth_user_id"),
	email: text().notNull(),
	name: text().notNull(),
	handle: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	onboardingStatus: text("onboarding_status").default('incomplete').notNull(),
	onboardingStep: integer("onboarding_step").default(1).notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
}, (table) => [
	index("user_auth_user_id_idx").using("btree", table.authUserId.asc().nullsLast().op("text_ops")),
	index("user_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("user_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("user_email_verified_idx").using("btree", table.emailVerified.asc().nullsLast().op("bool_ops")),
	unique("users_auth_user_id_unique").on(table.authUserId),
	unique("users_email_unique").on(table.email),
	unique("users_handle_unique").on(table.handle),
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
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "invoices_client_id_clients_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "invoices_creator_id_users_id_fk"
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
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "quotes_client_id_clients_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "quotes_creator_id_users_id_fk"
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

export const paymentSchedules = pgTable("payment_schedules", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	creatorId: text("creator_id").notNull(),
	clientId: text("client_id").notNull(),
	invoiceId: uuid("invoice_id").notNull(),
	projectId: uuid("project_id"),
	label: text().notNull(),
	amount: integer().notNull(),
	currency: text().notNull(),
	dueDate: timestamp("due_date", { mode: 'string' }).notNull(),
	milestone: text(),
	status: text().default('scheduled').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("payment_schedules_creator_id_idx").using("btree", table.creatorId.asc().nullsLast().op("text_ops")),
	index("payment_schedules_due_date_idx").using("btree", table.dueDate.asc().nullsLast().op("timestamp_ops")),
	index("payment_schedules_invoice_id_idx").using("btree", table.invoiceId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "payment_schedules_client_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "payment_schedules_creator_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.invoiceId],
			foreignColumns: [invoices.id],
			name: "payment_schedules_invoice_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "payment_schedules_project_id_fkey"
		}).onDelete("set null"),
	check("payment_schedules_amount_check", sql`amount > 0`),
]);

export const paymentTermAmendments = pgTable("payment_term_amendments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	creatorId: text("creator_id").notNull(),
	invoiceId: uuid("invoice_id").notNull(),
	previousTerms: text("previous_terms"),
	newTerms: text("new_terms").notNull(),
	agreementDate: timestamp("agreement_date", { mode: 'string' }).notNull(),
	evidenceReference: text("evidence_reference"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("payment_term_amendments_creator_id_idx").using("btree", table.creatorId.asc().nullsLast().op("text_ops")),
	index("payment_term_amendments_invoice_id_idx").using("btree", table.invoiceId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "payment_term_amendments_creator_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.invoiceId],
			foreignColumns: [invoices.id],
			name: "payment_term_amendments_invoice_id_fkey"
		}).onDelete("cascade"),
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
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "gallery_access_sessions_client_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.galleryId],
			foreignColumns: [galleries.id],
			name: "gallery_access_sessions_gallery_id_fkey"
		}).onDelete("cascade"),
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
			columns: [table.galleryId],
			foreignColumns: [galleries.id],
			name: "gallery_photo_actions_gallery_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.photoId],
			foreignColumns: [galleryPhotos.id],
			name: "gallery_photo_actions_photo_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [galleryAccessSessions.id],
			name: "gallery_photo_actions_session_id_fkey"
		}).onDelete("cascade"),
	unique("gallery_photo_actions_session_id_photo_id_key").on(table.photoId, table.sessionId),
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
	templateVersion: integer("template_version"),
	templateSnapshot: text("template_snapshot"),
	contractType: text("contract_type"),
	effectiveAt: timestamp("effective_at", { mode: 'string' }),
	termStartAt: timestamp("term_start_at", { mode: 'string' }),
	termEndAt: timestamp("term_end_at", { mode: 'string' }),
	renewalAt: timestamp("renewal_at", { mode: 'string' }),
	noticeDeadline: timestamp("notice_deadline", { mode: 'string' }),
	terminationAt: timestamp("termination_at", { mode: 'string' }),
	signatories: jsonb().default([]).notNull(),
}, (table) => [
	index("contracts_contract_type_idx").using("btree", table.contractType.asc().nullsLast().op("text_ops")),
	index("contracts_creator_id_idx").using("btree", table.creatorId.asc().nullsLast().op("text_ops")),
	index("contracts_term_end_at_idx").using("btree", table.termEndAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "contracts_client_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "contracts_creator_id_fkey"
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
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "gallery_approvals_client_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.galleryId],
			foreignColumns: [galleries.id],
			name: "gallery_approvals_gallery_id_fkey"
		}).onDelete("cascade"),
	unique("gallery_approvals_gallery_id_key").on(table.galleryId),
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
	version: integer().default(1).notNull(),
	reviewStatus: text("review_status").default('unreviewed').notNull(),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
}, (table) => [
	index("contract_templates_creator_id_idx").using("btree", table.creatorId.asc().nullsLast().op("text_ops")),
	index("contract_templates_version_idx").using("btree", table.id.asc().nullsLast().op("int4_ops"), table.version.asc().nullsLast().op("int4_ops")),
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
	actorId: text("actor_id"),
	outcome: text(),
}, (table) => [
	index("contract_events_contract_id_idx").using("btree", table.contractId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.contractId],
			foreignColumns: [contracts.id],
			name: "contract_events_contract_id_fkey"
		}).onDelete("cascade"),
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

export const sessions = pgTable("sessions", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	token: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("sessions_token_idx").using("btree", table.token.asc().nullsLast().op("text_ops")),
	index("sessions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_fkey"
		}).onDelete("cascade"),
	unique("sessions_token_key").on(table.token),
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

export const accounts = pgTable("accounts", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("accounts_provider_id_idx").using("btree", table.providerId.asc().nullsLast().op("text_ops")),
	index("accounts_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_user_id_fkey"
		}).onDelete("cascade"),
	unique("accounts_provider_account_unique").on(table.accountId, table.providerId),
]);

export const verifications = pgTable("verifications", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("verifications_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);

export const passkeys = pgTable("passkeys", {
	id: text().primaryKey().notNull(),
	name: text(),
	publicKey: text("public_key").notNull(),
	userId: text("user_id").notNull(),
	credentialId: text("credential_id").notNull(),
	counter: integer().notNull(),
	deviceType: text("device_type").notNull(),
	backedUp: boolean("backed_up").notNull(),
	transports: text(),
	aaguid: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("passkeys_credential_id_idx").using("btree", table.credentialId.asc().nullsLast().op("text_ops")),
	index("passkeys_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "passkeys_user_id_fkey"
		}).onDelete("cascade"),
	unique("passkeys_credential_id_key").on(table.credentialId),
]);

export const creatorPortfolios = pgTable("creator_portfolios", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	headline: text(),
	contactEmail: text("contact_email"),
	socialLinks: jsonb("social_links").default({}).notNull(),
	selectedProjectIds: jsonb("selected_project_ids").default([]).notNull(),
	layout: text().default('editorial').notNull(),
	isPublished: boolean("is_published").default(false).notNull(),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("creator_portfolios_published_idx").using("btree", table.isPublished.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "creator_portfolios_user_id_fkey"
		}).onDelete("cascade"),
	unique("creator_portfolios_user_id_key").on(table.userId),
]);

export const paymentAuditEvents = pgTable("payment_audit_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	creatorId: text("creator_id").notNull(),
	paymentId: uuid("payment_id").notNull(),
	eventType: text("event_type").notNull(),
	actorId: text("actor_id").notNull(),
	metadata: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("payment_audit_events_creator_id_idx").using("btree", table.creatorId.asc().nullsLast().op("text_ops")),
	index("payment_audit_events_payment_id_idx").using("btree", table.paymentId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.actorId],
			foreignColumns: [users.id],
			name: "payment_audit_events_actor_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "payment_audit_events_creator_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.paymentId],
			foreignColumns: [payments.id],
			name: "payment_audit_events_payment_id_fkey"
		}).onDelete("cascade"),
]);

export const projectMedia = pgTable("project_media", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id").notNull(),
	creatorId: text("creator_id").notNull(),
	filename: text().notNull(),
	originalUrl: text("original_url").notNull(),
	displayUrl: text("display_url").notNull(),
	thumbnailUrl: text("thumbnail_url").notNull(),
	storagePath: text("storage_path"),
	originalPath: text("original_path"),
	displayPath: text("display_path"),
	thumbnailPath: text("thumbnail_path"),
	watermarkPath: text("watermark_path"),
	processingStatus: text("processing_status").default('ready').notNull(),
	processingError: text("processing_error"),
	mimeType: text("mime_type"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	fileSize: bigint("file_size", { mode: "number" }),
	width: integer(),
	height: integer(),
	altText: text("alt_text"),
	caption: text(),
	sortOrder: integer("sort_order").default(0).notNull(),
	isHidden: boolean("is_hidden").default(false).notNull(),
	isCover: boolean("is_cover").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("project_media_creator_id_idx").using("btree", table.creatorId.asc().nullsLast().op("text_ops")),
	index("project_media_project_id_idx").using("btree", table.projectId.asc().nullsLast().op("uuid_ops")),
	index("project_media_project_sort_idx").using("btree", table.projectId.asc().nullsLast().op("uuid_ops"), table.sortOrder.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "project_media_creator_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_media_project_id_projects_id_fk"
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
	shortDescription: text("short_description"),
	slug: text(),
	category: text(),
	year: text(),
	location: text(),
	services: jsonb().default([]).notNull(),
	disciplines: jsonb().default([]).notNull(),
	collaborators: jsonb().default([]).notNull(),
	role: text(),
	scopeOfWork: text("scope_of_work"),
	deliverables: text(),
	totalAmount: integer("total_amount"),
	currency: text().default('KES'),
	paymentTerms: text("payment_terms"),
	revisionsPolicy: text("revisions_policy"),
	licensingTerms: text("licensing_terms"),
	noticePeriod: text("notice_period"),
	storyOverview: text("story_overview"),
	storyChallenge: text("story_challenge"),
	storyApproach: text("story_approach"),
	storyOutcome: text("story_outcome"),
	storyCredits: text("story_credits"),
	visibility: text().default('private').notNull(),
	featured: boolean().default(false).notNull(),
	coverMediaId: uuid("cover_media_id"),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
}, (table) => [
	index("projects_client_id_idx").using("btree", table.clientId.asc().nullsLast().op("text_ops")),
	index("projects_creator_id_idx").using("btree", table.creatorId.asc().nullsLast().op("text_ops")),
	index("projects_featured_idx").using("btree", table.featured.asc().nullsLast().op("bool_ops")),
	index("projects_published_at_idx").using("btree", table.publishedAt.asc().nullsLast().op("timestamp_ops")),
	index("projects_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("projects_visibility_idx").using("btree", table.visibility.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "projects_client_id_clients_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "projects_creator_id_users_id_fk"
		}).onDelete("cascade"),
	unique("projects_slug_unique").on(table.slug),
]);

export const studioEvents = pgTable("studio_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	creatorId: text("creator_id").notNull(),
	clientId: text("client_id"),
	projectId: uuid("project_id"),
	title: text().notNull(),
	description: text(),
	eventType: text("event_type").default('client_event').notNull(),
	status: text().default('planned').notNull(),
	startsAt: timestamp("starts_at", { mode: 'string' }).notNull(),
	endsAt: timestamp("ends_at", { mode: 'string' }),
	allDay: boolean("all_day").default(false).notNull(),
	location: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("studio_events_client_id_idx").using("btree", table.clientId.asc().nullsLast().op("text_ops")),
	index("studio_events_creator_id_idx").using("btree", table.creatorId.asc().nullsLast().op("text_ops")),
	index("studio_events_project_id_idx").using("btree", table.projectId.asc().nullsLast().op("uuid_ops")),
	index("studio_events_starts_at_idx").using("btree", table.startsAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "studio_events_client_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "studio_events_creator_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "studio_events_project_id_fkey"
		}).onDelete("set null"),
]);

export const calendarEvents = pgTable("calendar_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	creatorId: text("creator_id").notNull(),
	clientId: text("client_id"),
	projectId: uuid("project_id"),
	title: text().notNull(),
	description: text(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	location: text(),
	eventType: text("event_type").default('appointment').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("calendar_events_creator_id_idx").using("btree", table.creatorId.asc().nullsLast().op("text_ops")),
	index("calendar_events_start_date_idx").using("btree", table.startDate.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "calendar_events_client_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "calendar_events_creator_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "calendar_events_project_id_fkey"
		}).onDelete("set null"),
]);

export const expenses = pgTable("expenses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	creatorId: text("creator_id").notNull(),
	projectId: uuid("project_id"),
	description: text().notNull(),
	supplier: text(),
	category: text().notNull(),
	amount: integer().notNull(),
	currency: text().default('KES').notNull(),
	expenseDate: timestamp("expense_date", { mode: 'string' }).notNull(),
	paymentMethod: text("payment_method"),
	taxAmount: integer("tax_amount").default(0).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("expenses_creator_id_idx").using("btree", table.creatorId.asc().nullsLast().op("text_ops")),
	index("expenses_expense_date_idx").using("btree", table.expenseDate.asc().nullsLast().op("timestamp_ops")),
	index("expenses_project_id_idx").using("btree", table.projectId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "expenses_creator_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "expenses_project_id_fkey"
		}).onDelete("set null"),
]);

export const galleryWatermarks = pgTable("gallery_watermarks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	galleryId: uuid("gallery_id").notNull(),
	enabled: boolean().default(true).notNull(),
	text: text().default('KIPSMTHN').notNull(),
	position: text().default('bottom-right').notNull(),
	opacity: integer().default(55).notNull(),
	fontSize: integer("font_size").default(42).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	type: text().default('text').notNull(),
	imageUrl: text("image_url"),
	imagePath: text("image_path"),
	imageFilename: text("image_filename"),
	imageMimeType: text("image_mime_type"),
}, (table) => [
	foreignKey({
			columns: [table.galleryId],
			foreignColumns: [galleries.id],
			name: "gallery_watermarks_gallery_id_fkey"
		}).onDelete("cascade"),
	unique("gallery_watermarks_gallery_id_key").on(table.galleryId),
]);

export const creatorGalleryDefaults = pgTable("creator_gallery_defaults", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	defaultPhotoSelectionLimit: integer("default_photo_selection_limit").default(25).notNull(),
	defaultExpirationDays: integer("default_expiration_days").default(60).notNull(),
	defaultMasterPin: text("default_master_pin").default('4821'),
	defaultAllowDownloads: boolean("default_allow_downloads").default(true).notNull(),
	defaultAllowFavorites: boolean("default_allow_favorites").default(true).notNull(),
	defaultAllowSelections: boolean("default_allow_selections").default(true).notNull(),
	defaultRequirePin: boolean("default_require_pin").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_creator_gallery_defaults_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "creator_gallery_defaults_user_id_fkey"
		}).onDelete("cascade"),
	unique("creator_gallery_defaults_user_id_key").on(table.userId),
]);

export const creatorWorkspaceBranding = pgTable("creator_workspace_branding", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	customDomain: text("custom_domain"),
	hidePlatformBranding: boolean("hide_platform_branding").default(true).notNull(),
	headerLogoUrl: text("header_logo_url"),
	faviconUrl: text("favicon_url"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_creator_workspace_branding_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "creator_workspace_branding_user_id_fkey"
		}).onDelete("cascade"),
	unique("creator_workspace_branding_user_id_key").on(table.userId),
]);

export const payments = pgTable("payments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	creatorId: text("creator_id").notNull(),
	invoiceId: uuid("invoice_id"),
	amount: integer().notNull(),
	currency: text().notNull(),
	paymentDate: timestamp("payment_date", { mode: 'string' }),
	paymentMethod: text("payment_method"),
	transactionReference: text("transaction_reference"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	status: text().default('pending_verification').notNull(),
	paidAt: timestamp("paid_at", { mode: 'string' }).notNull(),
	reference: text().notNull(),
	confirmedAt: timestamp("confirmed_at", { mode: 'string' }),
	confirmedBy: text("confirmed_by"),
	evidenceReference: text("evidence_reference"),
	reversalReason: text("reversal_reason"),
	relatedPaymentId: uuid("related_payment_id"),
	providerName: text("provider_name"),
	externalTransactionId: text("external_transaction_id"),
	projectId: uuid("project_id"),
	origin: text().default('manual').notNull(),
	method: text().notNull(),
	clientId: text("client_id").notNull(),
}, (table) => [
	index("payments_client_id_idx").using("btree", table.clientId.asc().nullsLast().op("text_ops")),
	index("payments_creator_id_idx").using("btree", table.creatorId.asc().nullsLast().op("text_ops")),
	index("payments_invoice_id_idx").using("btree", table.invoiceId.asc().nullsLast().op("uuid_ops")),
	index("payments_paid_at_idx").using("btree", table.paidAt.asc().nullsLast().op("timestamp_ops")),
	index("payments_payment_date_idx").using("btree", table.paymentDate.asc().nullsLast().op("timestamp_ops")),
	index("payments_project_id_idx").using("btree", table.projectId.asc().nullsLast().op("uuid_ops")),
	index("payments_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "payments_client_id_clients_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "payments_creator_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.invoiceId],
			foreignColumns: [invoices.id],
			name: "payments_invoice_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.invoiceId],
			foreignColumns: [invoices.id],
			name: "payments_invoice_id_invoices_id_fk"
		}).onDelete("set null"),
	check("payments_amount_check", sql`amount > 0`),
]);

export const creatorEmailTemplates = pgTable("creator_email_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	invitationSubject: text("invitation_subject").default('Your Private Client Gallery is Ready — KIPSMTHN'),
	invitationBody: text("invitation_body").default('Hello {ClientName},\n\nYour private gallery "{GalleryTitle}" is now live on KIPSMTHN.\n\nUse your access PIN: {PIN} to view, favorite, and download your deliverables.\n\nBest regards,\n{CreatorName}'),
	reminderSubject: text("reminder_subject").default('Reminder: Your gallery "{GalleryTitle}" expires in {DaysRemaining} days'),
	reminderBody: text("reminder_body").default('Hello {ClientName},\n\nThis is a friendly reminder that your access to "{GalleryTitle}" will expire on {ExpiryDate}.\n\nVisit the gallery to make your final selections and downloads.\n\nBest regards,\n{CreatorName}'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_creator_email_templates_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "creator_email_templates_user_id_fkey"
		}).onDelete("cascade"),
	unique("creator_email_templates_user_id_key").on(table.userId),
]);

export const creatorNotificationPreferences = pgTable("creator_notification_preferences", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
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
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_creator_notification_preferences_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "creator_notification_preferences_user_id_fkey"
		}).onDelete("cascade"),
	unique("creator_notification_preferences_user_id_key").on(table.userId),
]);

export const creatorIntegrations = pgTable("creator_integrations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	integrationKey: text("integration_key").notNull(),
	name: text().notNull(),
	description: text(),
	status: text().default('inactive').notNull(),
	config: jsonb().default({}),
	connectedAt: timestamp("connected_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_creator_integrations_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "creator_integrations_user_id_fkey"
		}).onDelete("cascade"),
	unique("creator_integrations_user_id_integration_key_key").on(table.integrationKey, table.userId),
]);

export const galleryThemes = pgTable("gallery_themes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	galleryId: uuid("gallery_id").notNull(),
	name: text().default('Default').notNull(),
	type: text().default('preset').notNull(),
	layout: text().default('small_columns').notNull(),
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
	coverStyle: text("cover_style").default('full_image').notNull(),
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
	imageLayout: text("image_layout").default('small_columns').notNull(),
	imageOrientation: text("image_orientation").default('balanced').notNull(),
	imageSizing: text("image_sizing").default('medium').notNull(),
	galleryWidth: text("gallery_width").default('focused').notNull(),
	coverComposition: text("cover_composition").default('full_image').notNull(),
	coverImageId: uuid("cover_image_id"),
}, (table) => [
	unique("gallery_themes_gallery_id_key").on(table.galleryId),
]);

export const creatorBranding = pgTable("creator_branding", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	studioName: text("studio_name"),
	logoUrl: text("logo_url"),
	logoPath: text("logo_path"),
	logoLightUrl: text("logo_light_url"),
	logoLightPath: text("logo_light_path"),
	logoDarkUrl: text("logo_dark_url"),
	logoDarkPath: text("logo_dark_path"),
	logoTransparentUrl: text("logo_transparent_url"),
	logoTransparentPath: text("logo_transparent_path"),
	logoSvgUrl: text("logo_svg_url"),
	logoSvgPath: text("logo_svg_path"),
	logoSize: text("logo_size").default('medium').notNull(),
	brandColor: text("brand_color").default('#000000').notNull(),
	brandColorLight: text("brand_color_light").default('#FFFFFF').notNull(),
	coverBrandingVisible: boolean("cover_branding_visible").default(true).notNull(),
	navBrandingVisible: boolean("nav_branding_visible").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "creator_branding_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("creator_branding_user_id_unique").on(table.userId),
]);

export const entitlements = pgTable("entitlements", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	featureKey: text("feature_key").notNull(),
	enabled: boolean().default(true).notNull(),
	source: text().default('subscription').notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("entitlements_user_feature_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.featureKey.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "entitlements_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("entitlements_user_feature_unique").on(table.featureKey, table.userId),
]);

export const subscriptions = pgTable("subscriptions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	planId: uuid("plan_id").notNull(),
	status: text().default('active').notNull(),
	trialEndsAt: timestamp("trial_ends_at", { mode: 'string' }),
	currentPeriodStart: timestamp("current_period_start", { mode: 'string' }),
	currentPeriodEnd: timestamp("current_period_end", { mode: 'string' }),
	canceledAt: timestamp("canceled_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("subscriptions_user_status_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.planId],
			foreignColumns: [subscriptionPlans.id],
			name: "subscriptions_plan_id_subscription_plans_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "subscriptions_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const subscriptionPlans = pgTable("subscription_plans", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	slug: text().notNull(),
	name: text().notNull(),
	description: text(),
	priceAmount: integer("price_amount").default(0).notNull(),
	currency: text().default('KES').notNull(),
	billingInterval: text("billing_interval").default('monthly').notNull(),
	features: jsonb().default([]).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("subscription_plans_slug_unique").on(table.slug),
]);
