import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { Chirp, chirps } from "../schema.js";

export async function createChirp(chirp: Chirp) {
  const [result] = await db.insert(chirps).values(chirp).onConflictDoNothing().returning();
  return result;
}

export async function getChirps() {
  const result = await db.select().from(chirps).orderBy(chirps.createdAt);
  return result;
}

export async function getChirpById(chirpId: string) {
  const [result] = await db.select().from(chirps).where(eq(chirps.id, chirpId));
  return result;
}
