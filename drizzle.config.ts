import { defineConfig } from 'drizzle-kit'
export const connectionString = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

export default defineConfig({
 schema: [
  'src/db/user.ts',
 'src/db/session.ts',
 'src/db/email-varification.ts',
 'src/db/reset-token.ts',
 'src/db/service.ts',
//  'src/db/index.ts',
],
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
  verbose: true,
  strict: true,
  out:'migrations'
})