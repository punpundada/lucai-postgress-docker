import express from "express";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as users from "./db/user";
import * as session from "./db/session";
import * as emailVarification from './db/email-varification';
import * as resetToken from './db/reset-token';
import { userRoute } from "./routes/userRoute";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia, TimeSpan } from "lucia";
import { protectionCSRF } from "./middleware/authMiddleware";
// export const connectionString = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

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
  connectionString:process.env.DB_URL!,
});

let retry =2

const connectDB = async () => {
	  await client.connect();
};

while (retry > 0){
try {
	await client.connect();
	break;
} catch (error) {
	if(retry < 0){
		process.exit(1)
	}
	retry = retry -1;
	console.log(error)
	console.log('Trying to connect db failed remaining attempts: '+retry + ". Waiting for 2000ms")
	await new Promise(res=>setTimeout(res,2000))
}
}

export const db = drizzle(client, { schema: { 
	...users, 
	...session,
	...emailVarification,
	...resetToken
}, logger: true });

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
app.use(protectionCSRF)
app.use('/api/user',userRoute)
app.get('/hello-world',(req,res)=>{
	return res.status(200).json({
		message:"Hello World!,prajwal"
	})
})
app.listen(process.env.PORT, () => {
	console.log(process.env.DB_URL)
  console.log(`server running on http://localhost:${process.env.PORT}/api`);
});
