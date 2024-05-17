import express from "express";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as users from "./db/user";
export const connectionString = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

const client = new Client({
  connectionString,
});

const connectDB = async () => {
  await client.connect();
};
export const db = drizzle(client, { schema: { ...users }, logger: true });

connectDB();


const app = express();

app.listen(4000, () => {
  console.log("Server startre");
});
