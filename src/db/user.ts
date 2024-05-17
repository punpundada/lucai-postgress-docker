import { integer, pgEnum, pgTable, serial, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core';


export const userSchema = pgTable('users',{
    id:text('id').primaryKey()
})
