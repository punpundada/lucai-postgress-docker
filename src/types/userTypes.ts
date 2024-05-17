import { z } from "zod";
import { userSchema } from "../db/user";
import { createInsertSchema } from 'drizzle-zod';

export type userSelect = typeof userSchema.$inferSelect
export type userInsert = typeof userSchema.$inferInsert

export const userZodSchema = createInsertSchema(userSchema,{
    email:z.string().email('Incorrect email format'),
    password:z.string().min(6,'Minimum password should be 6').max(64,"Max password should be 64"),
    id:z.string().optional()
})