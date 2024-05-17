import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { adapter, db } from ".";
import { sessionsSchema } from "./db/session";
import { userSchema } from "./db/user";
import { Lucia, TimeSpan } from "lucia";

interface Session {
	id: string;
	userId: string;
	expiresAt: Date;
	fresh: boolean;
}




