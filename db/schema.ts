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
  varchar,
  pgEnum,
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
    stripeCustomerId: text("stripe_customer_id"),
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
    useDocument: boolean("use_document").default(false),
    useVoiceMode: boolean("use_voice_mode").default(false),
    themePreference: text("theme_preference").default("system"),
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

export const chats = pgTable(
  "chats",
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    messages: jsonb(),
    userId: uuid("user_id").default(sql`auth.uid()`),
    isKnowledgeBase: boolean("is_knowledge_base").default(false),
    knowledgeBaseId: uuid("knowledge_base_id"),
  },
  () => [
    pgPolicy("Users can read their own chats", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("Users can insert their own chats", {
      as: "permissive",
      for: "insert",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("Users can update their own chats", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("Users can delete their own chats", {
      as: "permissive",
      for: "delete",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
  ]
);

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
    // Embedding configuration
    allowEmbedding: boolean("allow_embedding").default(false),
    // Removed isPinned - now using separate user_pinned_knowledge_bases table
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
    embedConfig: jsonb("embed_config").default({}), // Configuration for embedded chat (colors, position, etc.)
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

export const knowledgeBaseShares = pgTable(
  "knowledge_base_shares",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    knowledgeBaseId: uuid("knowledge_base_id")
      .notNull()
      .references(() => knowledgeBases.id, { onDelete: "cascade" }),
    sharedWithEmail: text("shared_with_email").notNull(),
    sharedByUserId: uuid("shared_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
  },
  (table) => [
    unique("unique_kb_email_share").on(
      table.knowledgeBaseId,
      table.sharedWithEmail
    ),
    pgPolicy("Users can view shares for their knowledge bases", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(
        EXISTS (
          SELECT 1 FROM knowledge_bases kb 
          WHERE kb.id = knowledge_base_id 
          AND kb.user_id = auth.uid()
        )
      )`,
    }),
    pgPolicy("Users can create shares for their knowledge bases", {
      as: "permissive",
      for: "insert",
      to: ["public"],
      withCheck: sql`(
        EXISTS (
          SELECT 1 FROM knowledge_bases kb 
          WHERE kb.id = knowledge_base_id 
          AND kb.user_id = auth.uid()
        )
      )`,
    }),
    pgPolicy("Users can delete shares for their knowledge bases", {
      as: "permissive",
      for: "delete",
      to: ["public"],
      using: sql`(
        EXISTS (
          SELECT 1 FROM knowledge_bases kb 
          WHERE kb.id = knowledge_base_id 
          AND kb.user_id = auth.uid()
        )
      )`,
    }),
  ]
);

// User-specific pinned knowledge bases table
export const userPinnedKnowledgeBases = pgTable(
  "user_pinned_knowledge_bases",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    knowledgeBaseId: uuid("knowledge_base_id")
      .notNull()
      .references(() => knowledgeBases.id, { onDelete: "cascade" }),
    pinnedAt: timestamp("pinned_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
  },
  (table) => [
    unique("unique_user_kb_pin").on(table.userId, table.knowledgeBaseId),
    pgPolicy("Users can view their own pins", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("Users can create their own pins", {
      as: "permissive",
      for: "insert",
      to: ["public"],
      withCheck: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("Users can delete their own pins", {
      as: "permissive",
      for: "delete",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
  ]
);

// Subscription plan types
export const planTypeEnum = pgEnum("plan_type", [
  "free",
  "premium",
  "enterprise",
]);

// Subscription status types
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "trialing",
  "unpaid",
]);

// Plans table - defines available subscription plans
export const plans = pgTable(
  "plans",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    name: text().notNull(),
    description: text(),
    stripePriceId: text("stripe_price_id").notNull(),
    stripeProductId: text("stripe_product_id").notNull(),
    type: planTypeEnum("type").notNull(),
    price: integer().notNull(), // Price in cents
    interval: text().notNull(), // monthly, yearly, etc.
    features: jsonb(), // JSON array of features included in this plan
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    active: boolean().default(true),
    limits: jsonb(), // JSON object with plan limits (e.g., max documents, max KB size)
  },
  () => [
    pgPolicy("Anyone can view active plans", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(active = true)`,
    }),
  ]
);

// Subscriptions table - tracks user subscriptions
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id),
    stripeSubscriptionId: text("stripe_subscription_id").notNull(),
    status: subscriptionStatusEnum("status").notNull(),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    currentPeriodEnd: timestamp("current_period_end", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
    canceledAt: timestamp("canceled_at", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    metadata: jsonb(), // Additional subscription metadata
  },
  (table) => [
    pgPolicy("Users can view their own subscriptions", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
  ]
);

// Payments table - tracks payment history
export const payments = pgTable(
  "payments",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subscription_id: uuid("subscription_id").references(() => subscriptions.id),
    stripe_payment_intent_id: text("stripe_payment_intent_id"),
    stripe_invoice_id: text("stripe_invoice_id").notNull(),
    amount: integer().notNull(), // Amount in cents
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    status: text().notNull(), // succeeded, processing, requires_payment_method, etc.
    payment_method: text("payment_method").notNull(), // card, bank_transfer, etc.
    receipt_url: text("receipt_url"),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    metadata: jsonb().default({}), // Additional payment metadata
  },
  (table) => [
    pgPolicy("Users can view their own payments", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
  ]
);

// Usage records table - tracks usage for metered billing
export const usageRecords = pgTable(
  "usage_records",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id),
    category: text().notNull(), // e.g., "documents", "api_calls", "storage"
    quantity: integer().notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    metadata: jsonb(), // Additional usage metadata
  },
  (table) => [
    pgPolicy("Users can view their own usage records", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
  ]
);

// Embed access logs - tracks when embedded chatboxes are initialized
export const embedAccessLogs = pgTable(
  "embed_access_logs",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    knowledgeBaseId: uuid("knowledge_base_id")
      .notNull()
      .references(() => knowledgeBases.id, { onDelete: "cascade" }),
    chatId: text("chat_id").notNull(),
    referrer: text("referrer"),
    timestamp: timestamp("timestamp", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
  },
  (table) => [
    pgPolicy("Knowledge base owners can view embed access logs", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(
        EXISTS (
          SELECT 1 FROM knowledge_bases kb 
          WHERE kb.id = knowledge_base_id 
          AND kb.user_id = auth.uid()
        )
      )`,
    }),
  ]
);

// Embed message logs - tracks messages sent through embedded chatboxes
export const embedMessageLogs = pgTable(
  "embed_message_logs",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    knowledgeBaseId: uuid("knowledge_base_id")
      .notNull()
      .references(() => knowledgeBases.id, { onDelete: "cascade" }),
    chatId: text("chat_id").notNull(),
    message: text("message").notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
  },
  (table) => [
    pgPolicy("Knowledge base owners can view embed message logs", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(
        EXISTS (
          SELECT 1 FROM knowledge_bases kb 
          WHERE kb.id = knowledge_base_id 
          AND kb.user_id = auth.uid()
        )
      )`,
    }),
  ]
);
