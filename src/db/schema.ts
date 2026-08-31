import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  bigint,
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creatorProfiles = pgTable("creator_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  website: text("website"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creatorServices = pgTable("creator_services", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: text("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  defaultRate: integer("default_rate").default(0).notNull(),
  currency: text("currency").default("KES").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: text("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: text("client_id").references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("active").notNull(),
  // Optional scheduling fields for calendar views
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: integer("unit_price").default(0).notNull(),
  amount: integer("amount").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const equipment = pgTable("equipment", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  dailyRate: integer("daily_rate").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  brand: text("brand"),
  specs: text("specs"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
  coverPhotoId: uuid("cover_photo_id"),
  allowDownloads: boolean("allow_downloads").default(true).notNull(),
  allowFavorites: boolean("allow_favorites").default(true).notNull(),
  allowSelections: boolean("allow_selections").default(true).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const galleryCollections = pgTable("gallery_collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  galleryId: uuid("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const galleryPhotos = pgTable("gallery_photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  galleryId: uuid("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  collectionId: uuid("collection_id").references(() => galleryCollections.id, { onDelete: "set null" }),
  filename: text("filename").notNull(),
  originalUrl: text("original_url").notNull(),
  displayUrl: text("display_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  storagePath: text("storage_path"),
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const galleryAccessSessions = pgTable("gallery_access_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  galleryId: uuid("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  clientId: text("client_id").references(() => clients.id, { onDelete: "set null" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
});

export const galleryAccessAttempts = pgTable("gallery_access_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  galleryId: uuid("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address").notNull(),
  attemptCount: integer("attempt_count").default(0).notNull(),
  lastAttemptAt: timestamp("last_attempt_at").defaultNow().notNull(),
  lockoutUntil: timestamp("lockout_until"),
}, (table) => ({
  galleryIpIdx: unique().on(table.galleryId, table.ipAddress),
}));

export const galleryPhotoActions = pgTable("gallery_photo_actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => galleryAccessSessions.id, { onDelete: "cascade" }),
  galleryId: uuid("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  photoId: uuid("photo_id").notNull().references(() => galleryPhotos.id, { onDelete: "cascade" }),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  isSelected: boolean("is_selected").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const galleryApprovals = pgTable("gallery_approvals", {
  id: uuid("id").defaultRandom().primaryKey(),
  galleryId: uuid("gallery_id").notNull().unique().references(() => galleries.id, { onDelete: "cascade" }),
  clientId: text("client_id").references(() => clients.id, { onDelete: "set null" }),
  status: text("status").default("pending").notNull(),
  requestedAt: timestamp("requested_at"),
  respondedAt: timestamp("responded_at"),
  responseNote: text("response_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const galleryWatermarks = pgTable("gallery_watermarks", {
  id: uuid("id").defaultRandom().primaryKey(),
  galleryId: uuid("gallery_id").notNull().unique().references(() => galleries.id, { onDelete: "cascade" }),
  enabled: boolean("enabled").default(true).notNull(),
  text: text("text").default("KIPSMTHN").notNull(),
  position: text("position").default("bottom-right").notNull(),
  opacity: integer("opacity").default(55).notNull(),
  fontSize: integer("font_size").default(42).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
