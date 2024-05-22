import type { User } from "lucia";
import { db } from "..";
import { emailVarificationSchema } from "../db/email-varification";
import { eq } from "drizzle-orm";
import { isWithinExpirationDate } from "oslo";

export async function verifyVerificationCode(user: User, code: string): Promise<boolean> {

  return db.transaction(async (tx) => {

    const emailVar = await db.query.emailVarificationSchema.findFirst({
      where: ({ userId }, { eq }) => eq(userId, user.id),
    });

    console.log('emailVar',emailVar)
    console.log('code',code)

    if (!emailVar || emailVar.code !== code) {
      return false;
    }

    await tx
      .delete(emailVarificationSchema)
      .where(eq(emailVarificationSchema.id, emailVar.id));

    if (!isWithinExpirationDate(emailVar.expiresAt)) {
      return false;
    }
    if (emailVar.email.toString() !== user.email.toString()) {
      return false;
    }
    return true;
  });
}
