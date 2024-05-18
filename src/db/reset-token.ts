import {pgTable, text, timestamp } from "drizzle-orm/pg-core";


export const resetTokenSchema = pgTable('reset_tokens',{
    tokenHash:text('token_hash').unique().notNull(),
    userId:text('user_id').unique().notNull(),
    expiresAt:timestamp('expires_at',{
        withTimezone:true,
        mode:'date'
    }).notNull()
})