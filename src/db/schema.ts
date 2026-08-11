import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  authUserId: text("auth_user_id").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  handle: text("handle").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creatorProfiles = pgTable("creator_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.authUserId, { onDelete: "cascade" }),

  displayName: text("display_name"),
  headline: text("headline"),
  bio: text("bio"),
  location: text("location"),
  avatarUrl: text("avatar_url"),
  website: text("website"),
  instagramUrl: text("instagram_url"),
  linkedinUrl: text("linkedin_url"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: uuid("creator_id")
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

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  clientId: uuid("client_id").references(() => clients.id, {
    onDelete: "set null",
  }),

  title: text("title").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  category: text("category"),
  status: text("status").default("draft").notNull(),

  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  featured: boolean("featured").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});