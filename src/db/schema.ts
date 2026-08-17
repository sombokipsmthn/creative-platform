import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
} from "drizzle-orm/pg-core";

/*
|--------------------------------------------------------------------------
| Users
|--------------------------------------------------------------------------
*/

export const users = pgTable("users", {
  id: text("id").primaryKey(),

  authUserId: text("auth_user_id").notNull().unique(),

  email: text("email").notNull().unique(),

  name: text("name").notNull(),

  handle: text("handle").unique(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/*
|--------------------------------------------------------------------------
| Clients
|--------------------------------------------------------------------------
*/

export const clients = pgTable("clients", {
  id: text("id").primaryKey(),

  creatorId: text("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  name: text("name").notNull(),

  company: text("company"),

  email: text("email"),

  phone: text("phone"),

  website: text("website"),

  notes: text("notes"),

  status: text("status").default("active").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/*
|--------------------------------------------------------------------------
| Creator Profiles
|--------------------------------------------------------------------------
*/

export const creatorProfiles = pgTable("creator_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  bio: text("bio"),

  avatarUrl: text("avatar_url"),

  website: text("website"),

  location: text("location"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/*
|--------------------------------------------------------------------------
| Projects
|--------------------------------------------------------------------------
*/

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),

  creatorId: text("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  clientId: text("client_id").references(() => clients.id, {
    onDelete: "cascade",
  }),

  name: text("name").notNull(),

  description: text("description"),

  status: text("status").default("active").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/*
|--------------------------------------------------------------------------
| Invoices
|--------------------------------------------------------------------------
*/

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),

  creatorId: text("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),

  invoiceNumber: text("invoice_number").notNull(),

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

/*
|--------------------------------------------------------------------------
| Invoice Items
|--------------------------------------------------------------------------
*/

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").defaultRandom().primaryKey(),

  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),

  description: text("description").notNull(),

  quantity: integer("quantity").default(1).notNull(),

  unitPrice: integer("unit_price").default(0).notNull(),

  amount: integer("amount").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});