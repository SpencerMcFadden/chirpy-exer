import { db } from "../index.js";
import { User, users } from "../schema.js";

export async function createUser(user: User) {
  const [result] = await db.insert(users).values(user).onConflictDoNothing().returning();
  return result;
}
