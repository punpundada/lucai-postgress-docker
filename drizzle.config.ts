import { defineConfig } from 'drizzle-kit'
// export const connectionString = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

export default defineConfig({
 schema: [
  'src/db/user.ts',
 'src/db/session.ts',
 'src/db/email-varification.ts',
 'src/db/reset-token.ts',
],
  dialect: 'postgresql',
  dbCredentials: {
    // url: process.env.DB_URL!,
    database:process.env.POSTGRES_DB!,
    host:"localhost"!,
    password:process.env.POSTGRES_PASSWORD!,
    user:process.env.POSTGRES_USER!,
    port:+process.env.PORT!
  },
  verbose: true,
  strict: true,
  out:'migrations'
})