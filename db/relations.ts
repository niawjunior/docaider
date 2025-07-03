import { relations } from "drizzle-orm/relations";
import { usersInAuth, users, userConfig, credits } from "./schema";

export const usersRelations = relations(users, ({ one }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [users.id],
    references: [usersInAuth.id],
  }),
}));

export const usersInAuthRelations = relations(usersInAuth, ({ many }) => ({
  users: many(users),
  userConfigs: many(userConfig),
  credits: many(credits),
}));

export const userConfigRelations = relations(userConfig, ({ one }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [userConfig.id],
    references: [usersInAuth.id],
  }),
}));

export const creditsRelations = relations(credits, ({ one }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [credits.userId],
    references: [usersInAuth.id],
  }),
}));
