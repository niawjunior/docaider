import {
  pgTable,
  foreignKey,
  unique,
  uuid,
  timestamp,
  text,
  boolean,
  jsonb,
  pgPolicy,
  bigint,
  vector,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: uuid()
      .default(sql`auth.uid()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    email: text().notNull(),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    bio: text(),
    isActive: boolean("is_active").default(true),
    lastLogin: timestamp("last_login", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [table.id],
      name: "users_id_fkey",
    }).onDelete("cascade"),
    unique("unique_email").on(table.email),
  ]
);

export const userConfig = pgTable(
  "user_config",
  {
    id: uuid()
      .default(sql`auth.uid()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    languagePreference: text("language_preference").default("en"),
    themePreference: text("theme_preference").default("dark"),
    notificationSettings: jsonb("notification_settings").default({}),
    chatSettings: jsonb("chat_settings").default({}),
    defaultCurrency: text("default_currency").default("THB"),
    timezone: text().default("Asia/Bangkok"),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "user_config_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const chats = pgTable("chats", {
  id: text().primaryKey().notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  messages: jsonb(),
  userId: uuid("user_id").default(sql`auth.uid()`),
});

export const documents = pgTable(
  "documents",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "documents_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    title: text().notNull(),
    chunk: text().notNull(),
    embedding: vector({ dimensions: 1536 }).notNull(),
    userId: uuid("user_id").default(sql`auth.uid()`),
    documentId: text("document_id"),
    active: boolean().default(true),
    documentName: text("document_name"),
  },
  (table) => [
    pgPolicy("Users can read their own active documents", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`((auth.uid() = user_id) AND (active = true))`,
    }),
    pgPolicy("Users can delete their own documents", {
      as: "permissive",
      for: "all",
      to: ["public"],
    }),
    pgPolicy("Users can insert their own documents", {
      as: "permissive",
      for: "all",
      to: ["public"],
    }),
    pgPolicy("Users can update their own documents", {
      as: "permissive",
      for: "all",
      to: ["public"],
    }),
    pgPolicy("Users can view their own documents", {
      as: "permissive",
      for: "all",
      to: ["public"],
    }),
  ]
);

export const credits = pgTable(
  "credits",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    userId: uuid("user_id")
      .default(sql`auth.uid()`)
      .notNull(),
    balance: integer().default(0).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "credits_user_id_fkey",
    }).onDelete("cascade"),
    unique("unique_user_credits").on(table.userId),
    pgPolicy("Users can update their own credits", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("Users can view their own credits", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ]
);

export const chatShares = pgTable(
  "chat_shares",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    chatId: text("chat_id").notNull(),
    shareId: text("share_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    messages: jsonb(),
  },
  (table) => [
    unique("chat_shares_share_id_key").on(table.shareId),
    pgPolicy("Authenticated users can create shares", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
      withCheck: sql`true`,
    }),
    pgPolicy("Enable read access for all users", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ]
);
