import { TimeSpan, createDate } from "oslo";
import { sha256 } from "oslo/crypto";
import { encodeHex } from "oslo/encoding";
import { generateIdFromEntropySize } from "lucia";
import { db } from "..";
import { resetTokenSchema } from "../db/reset-token";
import { eq } from "drizzle-orm";

export async function createPasswordResetToken(userId: string): Promise<string> {
  await db.delete(resetTokenSchema).where(eq(resetTokenSchema.userId, userId));
  const tokenId = generateIdFromEntropySize(25); // 40 character
  const tokenHash = encodeHex(await sha256(new TextEncoder().encode(tokenId)));
  db.insert(resetTokenSchema).values({
    expiresAt:createDate(new TimeSpan(2, "h")),
    tokenHash,
    userId
  });
  return tokenHash
}