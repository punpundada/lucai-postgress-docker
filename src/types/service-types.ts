import { z } from "zod";
import { serviceSchema } from "../db/service";
import { createInsertSchema } from 'drizzle-zod';


export type serviceInsert = typeof serviceSchema.$inferInsert
export type serviceSelect = typeof serviceSchema.$inferSelect

export const serviceZodSchema = createInsertSchema(serviceSchema,{
    baseUrl:z.string({
        message:'Base Url is a required field'
    }).trim(),
    name:z.string({
        message:"name is a required field"
    }).trim()
})