import { relations } from 'drizzle-orm';
import { boolean, integer, pgEnum, pgTable, serial, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { sessionsSchema } from './session';


export const userSchema = pgTable('users',{
    id:text('id').primaryKey(),
    email:text('email').unique().notNull(),
    name:text('name').notNull(),
    password:text('password_hashed').notNull(),
    email_verified:boolean('email_verified').default(false),
})