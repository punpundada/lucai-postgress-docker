import { TimeSpan, createDate } from "oslo";
import { sha256 } from "oslo/crypto";
import { encodeHex } from "oslo/encoding";
import { generateIdFromEntropySize } from "lucia";
import { db } from "..";
import { resetTokenSchema } from "../db/reset-token";
import { eq } from "drizzle-orm";
import { getHashedToken } from "./utils";

export async function createPasswordResetToken(userId: string): Promise<string | undefined> {
  try {
    await db.delete(resetTokenSchema).where(eq(resetTokenSchema.userId, userId));
    const tokenId = generateIdFromEntropySize(25); // 40 character
    const tokenHash =  await getHashedToken(tokenId);
    await db.insert(resetTokenSchema).values({
      expiresAt:createDate(new TimeSpan(15, "m")),
      tokenHash,
      userId
    });
    return tokenId
  } catch (error) {
    console.log(error)
  }
}