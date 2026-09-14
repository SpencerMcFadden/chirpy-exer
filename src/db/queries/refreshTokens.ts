import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { refreshTokens, users } from "../schema.js";
import { config } from "../../config.js";

export async function saveRefreshToken(userId: string, token: string) {
  const [result] = await db
    .insert(refreshTokens)
    .values({
      userId: userId,
      token: token,
      expiresAt: new Date(Date.now() + config.jwt.refreshDuration),
      revokedAt: null,
    })
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getUserFromRefreshToken(token: string) {
  const [result] = await db
    .select({ user: users })
    .from(refreshTokens)
    .innerJoin(users, eq(refreshTokens.userId, users.id))
    .where(eq(refreshTokens.token, token));
  return result;
}

export async function revokeToken(token: string) {
  const now = new Date();
  const [result] = await db
    .update(refreshTokens)
    .set({ revokedAt: now, updatedAt: now })
    .where(eq(refreshTokens.token, token))
    .returning();
  return result;
}
