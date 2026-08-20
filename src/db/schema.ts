import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

/*
|--------------------------------------------------------------------------
| Users
|--------------------------------------------------------------------------
*/

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  authUserId: text("auth_user_id")
    .notNull()
    .unique(),

  email: text("email")
    .notNull()
    .unique(),

  name: text("name")
    .notNull(),

  handle: text("handle")
    .unique(),

  /*
   * Onboarding lifecycle.
   *
   * incomplete
   * complete
   */
  onboardingStatus: text("onboarding_status")
    .default("incomplete")
    .notNull(),

  /*
   * Current onboarding step.
   *
   * 1 = Profile
   * 2 = Services
   * 3 = Business
   * 4 = Finished
   */
  onboardingStep: integer("onboarding_step")
    .default(1)
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

/*
|--------------------------------------------------------------------------
| Creator Profiles
|--------------------------------------------------------------------------
|
| Additional public/business information for a creator.
|
| One user can have one creator profile.
|
*/

export const creatorProfiles = pgTable(
  "creator_profiles",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    bio: text("bio"),

    avatarUrl: text("avatar_url"),

    website: text("website"),

    location: text("location"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  }
);

/*
|--------------------------------------------------------------------------
| Creator Services
|--------------------------------------------------------------------------
|
| Services offered by the creator.
|
| Used by onboarding and later by the quotation/CRM system.
|
*/

export const creatorServices = pgTable(
  "creator_services",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    creatorId: text("creator_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    name: text("name")
      .notNull(),

    description: text("description"),

    category: text("category"),

    defaultRate: integer("default_rate")
      .default(0)
      .notNull(),

    currency: text("currency")
      .default("KES")
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  }
);

/*
|--------------------------------------------------------------------------
| Creator Business Profiles
|--------------------------------------------------------------------------
|
| Business and tax information for the creator.
|
| This is intentionally separate from creator_profiles because
| public profile information and financial/business information
| have different purposes and security considerations.
|
*/

export const creatorBusinessProfiles = pgTable(
  "creator_business_profiles",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    businessName: text("business_name"),

    phone: text("phone"),

    kraPin: text("kra_pin"),

    vatRegistered: boolean("vat_registered")
      .default(false)
      .notNull(),

    vatNumber: text("vat_number"),

    currency: text("currency")
      .default("KES")
      .notNull(),

    depositPercentage: integer("deposit_percentage")
      .default(50)
      .notNull(),

    whtRate: integer("wht_rate")
      .default(0)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  }
);

/*
|--------------------------------------------------------------------------
| Clients
|--------------------------------------------------------------------------
|
| CRM record for a creator's client.
|
*/

export const clients = pgTable("clients", {
  id: text("id")
    .primaryKey(),

  creatorId: text("creator_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  name: text("name")
    .notNull(),

  company: text("company"),

  email: text("email"),

  phone: text("phone"),

  website: text("website"),

  location: text("location"),

  notes: text("notes"),

  /*
   * General client record status.
   */
  status: text("status")
    .default("active")
    .notNull(),

  /*
   * CRM workflow status.
   */
  feedbackStatus: text("feedback_status")
    .default("AWAITING_FEEDBACK")
    .notNull(),

  /*
   * Contract workflow.
   */
  contractStatus: text("contract_status")
    .default("NOT_SENT")
    .notNull(),

  /*
   * eTIMS invoice workflow.
   */
  etimsInvoiceStatus: text("etims_invoice_status")
    .default("NOT_SENT")
    .notNull(),

  /*
   * Withholding tax certificate.
   */
  taxCertificateStatus: text("tax_certificate_status")
    .default("NOT_RECEIVED")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

/*
|--------------------------------------------------------------------------
| Projects
|--------------------------------------------------------------------------
*/

export const projects = pgTable("projects", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  creatorId: text("creator_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  clientId: text("client_id")
    .references(() => clients.id, {
      onDelete: "cascade",
    }),

  name: text("name")
    .notNull(),

  description: text("description"),

  status: text("status")
    .default("active")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

/*
|--------------------------------------------------------------------------
| Quotes
|--------------------------------------------------------------------------
*/

export const quotes = pgTable("quotes", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  creatorId: text("creator_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  clientId: text("client_id")
    .references(() => clients.id, {
      onDelete: "cascade",
    }),

  projectName: text("project_name"),

  title: text("title")
    .notNull(),

  status: text("status")
    .default("draft")
    .notNull(),

  subtotal: integer("subtotal")
    .default(0)
    .notNull(),

  discountType: text("discount_type")
    .default("none")
    .notNull(),

  discountValue: integer("discount_value")
    .default(0)
    .notNull(),

  discountAmount: integer("discount_amount")
    .default(0)
    .notNull(),

  tax: integer("tax")
    .default(0)
    .notNull(),

  total: integer("total")
    .default(0)
    .notNull(),

  currency: text("currency")
    .default("KES")
    .notNull(),

  paymentTerms: text("payment_terms"),

  validUntil: timestamp("valid_until"),

  quoteNumber: text("quote_number"),

  productionDays: integer("production_days")
    .default(1),

  location: text("location"),

  clientContact: text("client_contact"),

  depositPercentage: integer("deposit_percentage")
    .default(50),

  notes: text("notes"),

  /*
   * Set when the quote has been converted into an invoice.
   *
   * No FK is declared here because invoices.quoteId points
   * back to quotes.id.
   */
  invoiceId: uuid("invoice_id"),

  /*
   * Optimistic/version tracking.
   */
  version: integer("version")
    .default(1)
    .notNull(),

  /*
   * Soft-delete/archive support.
   */
  archivedAt: timestamp("archived_at"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

/*
|--------------------------------------------------------------------------
| Invoices
|--------------------------------------------------------------------------
*/

export const invoices = pgTable("invoices", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  creatorId: text("creator_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, {
      onDelete: "cascade",
    }),

  /*
   * Optional source quote.
   */
  quoteId: uuid("quote_id")
    .references(() => quotes.id, {
      onDelete: "set null",
    }),

  invoiceNumber: text("invoice_number")
    .notNull(),

  title: text("title")
    .default("Invoice")
    .notNull(),

  status: text("status")
    .default("draft")
    .notNull(),

  issueDate: timestamp("issue_date")
    .defaultNow()
    .notNull(),

  dueDate: timestamp("due_date"),

  notes: text("notes"),

  subtotal: integer("subtotal")
    .default(0)
    .notNull(),

  tax: integer("tax")
    .default(0)
    .notNull(),

  total: integer("total")
    .default(0)
    .notNull(),

  currency: text("currency")
    .default("USD")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

/*
|--------------------------------------------------------------------------
| Invoice Items
|--------------------------------------------------------------------------
*/

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, {
      onDelete: "cascade",
    }),

  description: text("description")
    .notNull(),

  quantity: integer("quantity")
    .default(1)
    .notNull(),

  unitPrice: integer("unit_price")
    .default(0)
    .notNull(),

  amount: integer("amount")
    .default(0)
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});

/*
|--------------------------------------------------------------------------
| Equipment
|--------------------------------------------------------------------------
*/

export const equipment = pgTable("equipment", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  name: text("name")
    .notNull(),

  dailyRate: integer("daily_rate")
    .notNull(),

  category: text("category")
    .notNull(),

  subcategory: text("subcategory"),

  brand: text("brand"),

  specs: text("specs"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

/*
|--------------------------------------------------------------------------
| Quote Items
|--------------------------------------------------------------------------
*/

export const quoteItems = pgTable("quote_items", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  quoteId: uuid("quote_id")
    .notNull()
    .references(() => quotes.id, {
      onDelete: "cascade",
    }),

  category: text("category")
    .notNull(),

  description: text("description")
    .notNull(),

  quantity: integer("quantity")
    .default(1)
    .notNull(),

  unit: text("unit")
    .default("unit")
    .notNull(),

  rate: integer("rate")
    .default(0)
    .notNull(),

  amount: integer("amount")
    .default(0)
    .notNull(),

  notes: text("notes"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});