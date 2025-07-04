import { relations } from "drizzle-orm/relations";
import {
  users,
  userConfig,
  credits,
  chats,
  documents,
  chatShares,
} from "./schema";

/**
 * Define database relations between tables
 *
 * This file establishes the relationships between different tables in the database
 * using Drizzle ORM's relations API.
 */

// User relations - connects users to their related data
export const usersRelations = relations(users, ({ one, many }) => ({
  // One-to-one relation with user configuration
  config: one(userConfig),
  // One-to-one relation with user credits
  credit: one(credits),
  // One-to-many relation with user chats
  chats: many(chats),
  // One-to-many relation with user documents
  documents: many(documents),
}));

// User config relations - connects user config back to users
export const userConfigRelations = relations(userConfig, ({ one }) => ({
  user: one(users),
}));

// Credits relations - connects credits back to users
export const creditsRelations = relations(credits, ({ one }) => ({
  user: one(users),
}));

// Chats relations - connects chats to users and chat shares
export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(users),
  shares: many(chatShares),
}));

// Documents relations - connects documents back to users
export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users),
}));

// Chat shares relations - connects chat shares back to chats
export const chatSharesRelations = relations(chatShares, ({ one }) => ({
  chat: one(chats),
}));
