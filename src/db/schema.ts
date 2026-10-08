import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  bigint,
  unique,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  authUserId: text("auth_user_id").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  handle: text("handle").unique(),
  onboardingStatus: text("onboarding_status").default("incomplete").notNull(),
  onboardingStep: integer("onboarding_step").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()});

export const creatorProfiles = pgTable("creator_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  website: text("website"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()});

export const creatorServices = pgTable("creator_services", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: text("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  defaultRate: integer("default_rate").default(0).notNull(),
  currency: text("currency").default("KES").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()});

export const creatorBusinessProfiles = pgTable("creator_business_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  businessName: text("business_name"),
  phone: text("phone"),
  kraPin: text("kra_pin"),
  vatRegistered: boolean("vat_registered").default(false).notNull(),
  vatNumber: text("vat_number"),
  currency: text("currency").default("KES").notNull(),
  depositPercentage: integer("deposit_percentage").default(50).notNull(),
  whtRate: integer("wht_rate").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()});

export const clients = pgTable("clients", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  location: text("location"),
  notes: text("notes"),
  status: text("status").default("active").notNull(),
  feedbackStatus: text("feedback_status").default("AWAITING_FEEDBACK").notNull(),
  contractStatus: text("contract_status").default("NOT_SENT").notNull(),
  etimsInvoiceStatus: text("etims_invoice_status").default("NOT_SENT").notNull(),
  taxCertificateStatus: text("tax_certificate_status").default("NOT_RECEIVED").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: text("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: text("client_id").references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  shortDescription: text("short_description"),
  slug: text("slug").unique(),
  category: text("category"),
  year: text("year"),
  location: text("location"),
  services: jsonb("services").default([]).notNull(),
  disciplines: jsonb("disciplines").default([]).notNull(),
  collaborators: jsonb("collaborators").default([]).notNull(),
  role: text("role"),
  scopeOfWork: text("scope_of_work"),
  deliverables: text("deliverables"),
  totalAmount: integer("total_amount"),
  currency: text("currency").default("KES"),
  paymentTerms: text("payment_terms"),
  revisionsPolicy: text("revisions_policy"),
  licensingTerms: text("licensing_terms"),
  noticePeriod: text("notice_period"),
  storyOverview: text("story_overview"),
  storyChallenge: text("story_challenge"),
  storyApproach: text("story_approach"),
  storyOutcome: text("story_outcome"),
  storyCredits: text("story_credits"),
  status: text("status").default("draft").notNull(),
  visibility: text("visibility").default("private").notNull(),
  featured: boolean("featured").default(false).notNull(),
  coverMediaId: uuid("cover_media_id"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()},
  (table) => ({
    creatorIdx: index("projects_creator_id_idx").on(table.creatorId),
    clientIdx: index("projects_client_id_idx").on(table.clientId),
    slugIdx: index("projects_slug_idx").on(table.slug),
    featuredIdx: index("projects_featured_idx").on(table.featured),
    publishedIdx: index("projects_published_at_idx").on(table.publishedAt),
    visibilityIdx: index("projects_visibility_idx").on(table.visibility),
  }));

export const projectMedia = pgTable("project_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  creatorId: text("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  originalUrl: text("original_url").notNull(),
  displayUrl: text("display_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  storagePath: text("storage_path"),
  originalPath: text("original_path"),
  displayPath: text("display_path"),
  thumbnailPath: text("thumbnail_path"),
  watermarkPath: text("watermark_path"),
  processingStatus: text("processing_status").default("ready").notNull(),
  processingError: text("processing_error"),
  mimeType: text("mime_type"),
  fileSize: bigint("file_size", { mode: "number" }),
  width: integer("width"),
  height: integer("height"),
  altText: text("alt_text"),
  caption: text("caption"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isHidden: boolean("is_hidden").default(false).notNull(),
  isCover: boolean("is_cover").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()},
  (table) => ({
    projectIdx: index("project_media_project_id_idx").on(table.projectId),
    creatorIdx: index("project_media_creator_id_idx").on(table.creatorId),
    projectSortIdx: index("project_media_project_sort_idx").on(table.projectId, table.sortOrder),
  }));

export const quotes = pgTable("quotes", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: text("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: text("client_id").references(() => clients.id, { onDelete: "cascade" }),
  projectName: text("project_name"),
  title: text("title").notNull(),
  status: text("status").default("draft").notNull(),
  subtotal: integer("subtotal").default(0).notNull(),
  discountType: text("discount_type").default("none").notNull(),
  discountValue: integer("discount_value").default(0).notNull(),
  discountAmount: integer("discount_amount").default(0).notNull(),
  tax: integer("tax").default(0).notNull(),
  total: integer("total").default(0).notNull(),
  currency: text("currency").default("KES").notNull(),
  paymentTerms: text("payment_terms"),
  validUntil: timestamp("valid_until"),
  quoteNumber: text("quote_number"),
  productionDays: integer("production_days").default(1),
  location: text("location"),
  clientContact: text("client_contact"),
  depositPercentage: integer("deposit_percentage").default(50),
  notes: text("notes"),
  invoiceId: uuid("invoice_id"),
  version: integer("version").default(1).notNull(),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()});

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: text("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: text("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  quoteId: uuid("quote_id").references(() => quotes.id, { onDelete: "set null" }),
  invoiceNumber: text("invoice_number").notNull().unique(),
  title: text("title").default("Invoice").notNull(),
  status: text("status").default("draft").notNull(),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
  notes: text("notes"),
  subtotal: integer("subtotal").default(0).notNull(),
  tax: integer("tax").default(0).notNull(),
  total: integer("total").default(0).notNull(),
  currency: text("currency").default("USD").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()});

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: integer("unit_price").default(0).notNull(),
  amount: integer("amount").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()});

export const equipment = pgTable("equipment", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  dailyRate: integer("daily_rate").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  brand: text("brand"),
  specs: text("specs"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()});

export const quoteItems = pgTable("quote_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  quoteId: uuid("quote_id").notNull().references(() => quotes.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unit: text("unit").default("unit").notNull(),
  rate: integer("rate").default(0).notNull(),
  amount: integer("amount").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()});

export const galleries = pgTable("galleries", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: text("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: text("client_id").references(() => clients.id, { onDelete: "set null" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  slug: text("slug").notNull().unique(),
  accessPin: text("access_pin"),
  status: text("status").default("draft").notNull(),
  coverPhotoId: uuid("cover_photo_id"), // FK to gallery_photos.id enforced at DB level (circular ref)
  allowDownloads: boolean("allow_downloads").default(true).notNull(),
  allowFavorites: boolean("allow_favorites").default(true).notNull(),
  allowSelections: boolean("allow_selections").default(true).notNull(),
  focal_point: jsonb("focal_point").default("{}"),
  expiresAt: timestamp("expires_at"),
  expiryBehavior: text("expiry_behavior").default("hide").notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()},
  (table) => ({
    creatorIdx: index("galleries_creator_id_idx").on(table.creatorId),
    clientIdx: index("galleries_client_id_idx").on(table.clientId),
    projectIdx: index("galleries_project_id_idx").on(table.projectId),
    slugIdx: index("galleries_slug_idx").on(table.slug),
  }));

export const galleryCollections = pgTable("gallery_collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  galleryId: uuid("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()},
  (table) => ({
    galleryIdx: index("gallery_collections_gallery_id_idx").on(table.galleryId),
  }));

export const galleryPhotos = pgTable("gallery_photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  galleryId: uuid("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  collectionId: uuid("collection_id").references(() => galleryCollections.id, { onDelete: "set null" }),
  filename: text("filename").notNull(),
  originalUrl: text("original_url").notNull(),
  displayUrl: text("display_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  storagePath: text("storage_path"),
  originalPath: text("original_path"),
  displayPath: text("display_path"),
  thumbnailPath: text("thumbnail_path"),
  watermarkPath: text("watermark_path"),
  processingStatus: text("processing_status").default("ready").notNull(),
  processingError: text("processing_error"),
  mimeType: text("mime_type"),
  fileSize: bigint("file_size", { mode: "number" }),
  width: integer("width"),
  height: integer("height"),
  captureDate: timestamp("capture_date"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isHidden: boolean("is_hidden").default(false).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  isSelected: boolean("is_selected").default(false).notNull(),
  downloadCount: integer("download_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()},
  (table) => ({
    galleryIdx: index("gallery_photos_gallery_id_idx").on(table.galleryId),
    collectionIdx: index("gallery_photos_collection_id_idx").on(table.collectionId),
    galleryCollectionSortIdx: index("gallery_photos_gallery_collection_sort_idx").on(table.galleryId, table.collectionId, table.sortOrder),
  }));

export const galleryThemes = pgTable("gallery_themes", {
  id: uuid("id").defaultRandom().primaryKey(),
  galleryId: uuid("gallery_id").notNull().unique().references(() => galleries.id, { onDelete: "cascade" }),
  name: text("name").default("Default").notNull(),
  type: text("type").default("preset").notNull(),
  layout: text("layout").default("masonry").notNull(),
  accentColor: text("accent_color").default("#000000").notNull(),
  backgroundColor: text("background_color").default("#ffffff").notNull(),
  textColor: text("text_color").default("#000000").notNull(),
  borderRadius: integer("border_radius").default(0).notNull(),
  showTitle: boolean("show_title").default(true).notNull(),
  showDescription: boolean("show_description").default(true).notNull(),
  showCollections: boolean("show_collections").default(true).notNull(),
  showLogo: boolean("show_logo").default(true).notNull(),
  masonryColumns: integer("masonry_columns").default(4).notNull(),
  aspectRatio: text("aspect_ratio").default("auto").notNull(),
  fontFamily: text("font_family").default("sans").notNull(),
  coverStyle: text("cover_style").default("image").notNull(),
  coverFocalX: integer("cover_focal_x").default(50).notNull(),
  coverFocalY: integer("cover_focal_y").default(50).notNull(),
  coverOverlayOpacity: integer("cover_overlay_opacity").default(25).notNull(),
  gridStyle: text("grid_style").default("masonry").notNull(),
  thumbnailSize: text("thumbnail_size").default("regular").notNull(),
  gridSpacing: text("grid_spacing").default("regular").notNull(),
  navigationStyle: text("navigation_style").default("icons-and-text").notNull(),
  customCSS: text("custom_css"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()});

export const galleryAccessSessions = pgTable("gallery_access_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  galleryId: uuid("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  clientId: text("client_id").references(() => clients.id, { onDelete: "set null" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull()},
  (table) => ({
    galleryIdx: index("gallery_access_sessions_gallery_idx").on(table.galleryId),
  }));

export const galleryAccessAttempts = pgTable("gallery_access_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  galleryId: uuid("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address").notNull(),
  attemptCount: integer("attempt_count").default(0).notNull(),
  lastAttemptAt: timestamp("last_attempt_at").defaultNow().notNull(),
  lockoutUntil: timestamp("lockout_until")}, (table) => ({
  galleryIpIdx: unique().on(table.galleryId, table.ipAddress)}));

export const galleryPhotoActions = pgTable("gallery_photo_actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => galleryAccessSessions.id, { onDelete: "cascade" }),
  galleryId: uuid("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  photoId: uuid("photo_id").notNull().references(() => galleryPhotos.id, { onDelete: "cascade" }),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  isSelected: boolean("is_selected").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()},
  (table) => ({
    sessionPhotoUnique: unique("gallery_photo_actions_session_photo_unique").on(table.sessionId, table.photoId),
    galleryIdx: index("gallery_photo_actions_gallery_idx").on(table.galleryId),
    photoIdx: index("gallery_photo_actions_photo_idx").on(table.photoId),
  }));

export const galleryComments = pgTable("gallery_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  galleryId: uuid("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  photoId: uuid("photo_id").notNull().references(() => galleryPhotos.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").references(() => galleryAccessSessions.id, { onDelete: "set null" }),
  authorType: text("author_type").default("client").notNull(),
  authorName: text("author_name").default("Client").notNull(),
  body: text("body").notNull(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()},
  (table) => ({
    photoCreatedIdx: index("gallery_comments_photo_created_idx").on(table.photoId, table.createdAt),
  }));

export const galleryActivity = pgTable("gallery_activity", {
  id: uuid("id").defaultRandom().primaryKey(),
  galleryId: uuid("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").references(() => galleryAccessSessions.id, { onDelete: "set null" }),
  photoId: uuid("photo_id").references(() => galleryPhotos.id, { onDelete: "set null" }),
  collectionId: uuid("collection_id").references(() => galleryCollections.id, { onDelete: "set null" }),
  eventType: text("event_type").notNull(),
  clientName: text("client_name"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull()});

export const galleryApprovals = pgTable("gallery_approvals", {
  id: uuid("id").defaultRandom().primaryKey(),
  galleryId: uuid("gallery_id").notNull().unique().references(() => galleries.id, { onDelete: "cascade" }),
  clientId: text("client_id").references(() => clients.id, { onDelete: "set null" }),
  status: text("status").default("pending").notNull(),
  requestedAt: timestamp("requested_at"),
  respondedAt: timestamp("responded_at"),
  responseNote: text("response_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()});

export const galleryWatermarks = pgTable("gallery_watermarks", {
  id: uuid("id").defaultRandom().primaryKey(),
  galleryId: uuid("gallery_id").notNull().unique().references(() => galleries.id, { onDelete: "cascade" }),
  enabled: boolean("enabled").default(true).notNull(),
  text: text("text").default("KIPSMTHN").notNull(),
  position: text("position").default("bottom-right").notNull(),
  opacity: integer("opacity").default(55).notNull(),
  fontSize: integer("font_size").default(42).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()});

export const galleryDownloadPresets = pgTable("gallery_download_presets", {
  id: uuid("id").defaultRandom().primaryKey(),
  galleryId: uuid("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  variant: text("variant").default("display").notNull(),
  maxWidth: integer("max_width"),
  quality: integer("quality").default(90).notNull(),
  format: text("format").default("jpg").notNull(),
  includeWatermark: boolean("include_watermark").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()},
  (table) => ({
    galleryIdx: index("gallery_download_presets_gallery_idx").on(table.galleryId),
  }));

export const galleryDownloads = pgTable("gallery_downloads", {
  id: uuid("id").defaultRandom().primaryKey(),
  galleryId: uuid("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  photoId: uuid("photo_id").references(() => galleryPhotos.id, { onDelete: "set null" }),
  presetId: uuid("preset_id").references(() => galleryDownloadPresets.id, { onDelete: "set null" }),
  sessionId: uuid("session_id").references(() => galleryAccessSessions.id, { onDelete: "set null" }),
  downloadType: text("download_type").default("single").notNull(),
  filename: text("filename"),
  bytes: bigint("bytes", { mode: "number" }),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull()},
  (table) => ({
    galleryCreatedIdx: index("gallery_downloads_gallery_created_idx").on(table.galleryId, table.createdAt),
    photoCreatedIdx: index("gallery_downloads_photo_created_idx").on(table.photoId, table.createdAt),
  }));

export const contractTemplates = pgTable("contract_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: text("creator_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  documentType: text("document_type").notNull(),
  content: text("content").notNull(),
  variables: jsonb("variables").default([]).notNull(),
  isSystemTemplate: boolean("is_system_template").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()},
  (table) => ({
    creatorIdx: index("contract_templates_creator_id_idx").on(table.creatorId),
    systemIdx: index("contract_templates_is_system_idx").on(table.isSystemTemplate),
  }));

export const contracts = pgTable("contracts", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: text("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: text("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  quoteId: uuid("quote_id").references(() => quotes.id, { onDelete: "set null" }),
  templateId: uuid("template_id").references(() => contractTemplates.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  contractNumber: text("contract_number").notNull().unique(),
  status: text("status").default("draft").notNull(),
  content: text("content").notNull(),
  currency: text("currency").default("KES"),
  totalAmount: integer("total_amount"),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  signedAt: timestamp("signed_at"),
  signerName: text("signer_name"),
  signerEmail: text("signer_email"),
  signedIp: text("signed_ip"),
  signedUserAgent: text("signed_user_agent"),
  declinedAt: timestamp("declined_at"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()},
  (table) => ({
    creatorIdx: index("contracts_creator_id_idx").on(table.creatorId),
    clientIdx: index("contracts_client_id_idx").on(table.clientId),
    projectIdx: index("contracts_project_id_idx").on(table.projectId),
    quoteIdx: index("contracts_quote_id_idx").on(table.quoteId),
    templateIdx: index("contracts_template_id_idx").on(table.templateId),
    statusIdx: index("contracts_status_idx").on(table.status),
    tokenIdx: index("contracts_token_idx").on(table.token),
  }));

export const contractEvents = pgTable("contract_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  contractId: uuid("contract_id").notNull().references(() => contracts.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()},
  (table) => ({
    contractIdx: index("contract_events_contract_id_idx").on(table.contractId),
  }));

export const uploadAudit = pgTable("upload_audit", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  galleryId: uuid("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: bigint("file_size", { mode: "number" }).notNull(),
  blobPath: text("blob_path").notNull(),
  success: boolean("success").notNull(),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Better Auth core tables.
export const authUsers = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const authSessions = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
});

export const authAccounts = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const authVerifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
