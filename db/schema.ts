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
    pgPolicy("Users can view their own profile", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = id)`,
    }),
    pgPolicy("Anyone can view public profile info", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
    pgPolicy("Users can insert their own profile", {
      as: "permissive",
      for: "insert",
      to: ["public"],
      withCheck: sql`(auth.uid() = id)`,
    }),
    pgPolicy("Users can update their own profile", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`(auth.uid() = id)`,
    }),
    pgPolicy("Users can delete their own profile", {
      as: "permissive",
      for: "delete",
      to: ["public"],
      using: sql`(auth.uid() = id)`,
    }),
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
    pgPolicy("Users can view their own config", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = id)`,
    }),
    pgPolicy("Users can insert their own config", {
      as: "permissive",
      for: "insert",
      to: ["public"],
      withCheck: sql`(auth.uid() = id)`,
    }),
    pgPolicy("Users can update their own config", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`(auth.uid() = id)`,
    }),
    pgPolicy("Users can delete their own config", {
      as: "permissive",
      for: "delete",
      to: ["public"],
      using: sql`(auth.uid() = id)`,
    }),
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
  isKnowledgeBase: boolean("is_knowledge_base").default(false),
  knowledgeBaseId: uuid("knowledge_base_id"),
});

// Main documents table - stores unique document metadata
export const documents = pgTable("documents", {
  id: bigint({ mode: "number" })
    .generatedByDefaultAsIdentity()
    .primaryKey()
    .notNull(),
  title: text().notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  // Keep the original documentId field for backward compatibility
  documentId: text("document_id"),
  url: text("url"),
  userId: uuid("user_id").default(sql`auth.uid()`),
  documentName: text("document_name"),
  isKnowledgeBase: boolean("is_knowledge_base").default(false),
  active: boolean().default(true),
});

// Document chunks table - stores individual chunks with embeddings
export const documentChunks = pgTable(
  "document_chunks",
  {
    id: bigint({ mode: "number" })
      .generatedByDefaultAsIdentity()
      .primaryKey()
      .notNull(),
    documentId: text("document_id").notNull(),
    userId: uuid("user_id").default(sql`auth.uid()`),
    chunk: text().notNull(),
    embedding: vector({ dimensions: 3072 }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    active: boolean().default(true),
    isKnowledgeBase: boolean("is_knowledge_base").default(false),
  },
  () => [
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

export const knowledgeBases = pgTable(
  "knowledge_bases",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    description: text(),
    isPublic: boolean("is_public").default(false),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    documentIds: text("document_ids").array(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
  },
  () => [
    pgPolicy("Users can view their own knowledge bases", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("Anyone can view public knowledge bases", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(is_public = true)`,
    }),
    pgPolicy("Users can insert their own knowledge bases", {
      as: "permissive",
      for: "insert",
      to: ["public"],
      withCheck: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("Users can update their own knowledge bases", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("Users can delete their own knowledge bases", {
      as: "permissive",
      for: "delete",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
  ]
);
