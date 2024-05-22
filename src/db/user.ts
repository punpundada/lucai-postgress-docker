import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core";
import { emailVarificationSchema } from "./email-varification";
import { serviceSchema } from "./service";

export const userSchema = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  password: text("password_hashed").notNull(),
  email_verified: boolean("email_verified").default(false),
  serviceId:integer('service_id').notNull()
});

export const userRelations = relations(userSchema, ({ one }) => ({
  emailVarification: one(emailVarificationSchema, {
    fields: [userSchema.id],
    references: [emailVarificationSchema.userId],
  }),
  service:one(serviceSchema,{fields:[userSchema.serviceId],references:[serviceSchema.id]})
}));
