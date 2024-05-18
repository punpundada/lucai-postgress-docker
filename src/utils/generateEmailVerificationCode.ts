import { TimeSpan, createDate } from "oslo";
import { generateRandomString, alphabet } from "oslo/crypto";
import { db } from "..";
import { emailVarificationSchema } from "../db/email-varification";
import { eq } from "drizzle-orm";

export async function generateEmailVerificationCode(userId: string, email: string): Promise<string> {
	const code = generateRandomString(8, alphabet("0-9"));
    await db.transaction(async (tx) => {
        await tx.delete(emailVarificationSchema).where(eq(emailVarificationSchema.userId,userId))
        db.insert(emailVarificationSchema).values({
            userId,
            email,
            code,
            expiresAt:createDate(new TimeSpan(15, "m")) //15 mins
        })
    })
	return code;
}