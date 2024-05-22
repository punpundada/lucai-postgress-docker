import { relations } from "drizzle-orm";
import { boolean, pgTable, serial, text } from "drizzle-orm/pg-core";
import { userSchema } from "./user";

export const serviceSchema = pgTable('services',{
    id:serial('id').primaryKey(),
    name:text('name').notNull(),
    baseUrl:text('base_url').notNull(),
    isActive:boolean('is_active').default(true)
})

export const servicesRelations =relations(serviceSchema,({many})=>({
    users:many(userSchema)
}))