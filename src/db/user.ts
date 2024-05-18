import { relations } from "drizzle-orm";
import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { emailVarificationSchema } from "./email-varification";

export const userSchema = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  password: text("password_hashed").notNull(),
  email_verified: boolean("email_verified").default(false),
});

export const userRelations = relations(userSchema, ({ one }) => ({
  emailVarification: one(emailVarificationSchema, {
    fields: [userSchema.id],
    references: [emailVarificationSchema.userId],
  }),
}));
