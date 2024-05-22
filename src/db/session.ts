import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { userSchema } from "./user";
import { relations } from "drizzle-orm";


export const sessionsSchema = pgTable('sessions',{
    id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => userSchema.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date"
	}).notNull()
})