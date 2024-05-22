import { z } from "zod";
import { userSchema } from "../db/user";
import { createInsertSchema } from 'drizzle-zod';
import { PasswordType } from "./until-types";

export type userSelect = typeof userSchema.$inferSelect
export type userInsert = typeof userSchema.$inferInsert


export const userZodSchema = createInsertSchema(userSchema,{
    email:z.string().email('Incorrect email format'),
    password:PasswordType,
    id:z.string().optional(),
    email_verified:z.boolean().optional().default(false)
})
