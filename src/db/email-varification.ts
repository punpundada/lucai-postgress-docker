import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { userSchema } from "./user";

export const emailVarificationSchema = pgTable("email_varification", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  userId: text("user_id")
    .unique()
    .references(() => userSchema.id).notNull(),
  email: text("email").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const emailVarificationRelations = relations(
  emailVarificationSchema,
  ({ one }) => ({
    user: one(userSchema, {
      fields: [emailVarificationSchema.userId],
      references: [userSchema.id],
    }),
  })
);
