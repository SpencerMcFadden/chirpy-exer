import { eq, and, gt, isNull } from "drizzle-orm";
import { db } from "../index.js";
import { refreshTokens, User, users } from "../schema.js";

export async function createUser(user: User) {
  const [result] = await db.insert(users).values(user).onConflictDoNothing().returning();
  return result;
}

export async function getUserByEmail(email: string) {
  const [result] = await db.select().from(users).where(eq(users.email, email));
  return result;
}

export async function getUserFromRefreshToken(token: string) {
  const now = new Date();
  const [result] = await db
    .select()
    .from(users)
    .innerJoin(refreshTokens, eq(users.id, refreshTokens.userId))
    .where(
      and(
        eq(refreshTokens.token, token),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, now),
      ),
    );
  return result;
}
export async function updateUser(userId: string, email: string, password: string) {
  const [result] = await db
    .update(users)
    .set({ email: email, hashedPassword: password })
    .where(eq(users.id, userId))
    .returning();
  return result;
}
export async function deleteUsers() {
  const [result] = await db.delete(users).returning();
  return result;
}
