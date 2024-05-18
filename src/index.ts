import express from "express";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as users from "./db/user";
import * as session from "./db/session";
import { userRoute } from "./routes/userRoute";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia, TimeSpan } from "lucia";
export const connectionString = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseSessionAttributes: DatabaseSessionAttributes;
        DatabaseUserAttributes: DatabaseUserAttributes;
	}
	interface DatabaseSessionAttributes {
		ip_country: string;
	}
    interface DatabaseUserAttributes {
        email: string;
        name:string;
        id:string
		email_verified: boolean;
    }
}

const client = new Client({
  connectionString,
});

const connectDB = async () => {
  await client.connect();
};
await connectDB();

export const db = drizzle(client, { schema: { ...users, ...session }, logger: false });

export const adapter =new DrizzlePostgreSQLAdapter(db, session.sessionsSchema, users.userSchema);

export const lucia = new Lucia(adapter, {
	sessionExpiresIn: new TimeSpan(2, "w"), // 2 weeks
    getSessionAttributes: (attributes) => {
		return {
			ipCountry: attributes.ip_country
		};
	},
    getUserAttributes: (attributes) => {
		return attributes
	},
    sessionCookie:{
        name: "session_user",
		expires: false, // session cookies have very long lifespan (2 years)
		attributes: {
			secure: process.env.env === "PROD",
			// sameSite: "strict",
			// domain: "example.com"
		}
    }
});

const app = express();
app.use(express.json())
app.use('/api/user',userRoute)

app.listen(4000, () => {
  console.log(`server started on http://localhost:${process.env.PORT}/api`);
});
