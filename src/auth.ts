import { hash, verify } from "argon2";
import { JwtPayload, sign, verify as jwtverify } from "jsonwebtoken";
import { UnauthorizedError } from "./api/errors.js";

const TOKEN_ISSUER = "chirpy";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string): Promise<string> {
  return hash(password);
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
  if (!password) {
    return false;
  }
  try {
    return await verify(hash, password);
  } catch {
    return false;
  }
}

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
  const now = Math.floor(Date.now() / 100);
  const expires = now + expiresIn;
  const payload: payload = {
    iss: TOKEN_ISSUER,
    sub: userID,
    iat: now,
    exp: expires,
  };
  return sign(payload, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
  let token: payload;
  try {
    token = jwtverify(tokenString, secret) as JwtPayload;
  } catch (error) {
    throw new UnauthorizedError(`Token is invalid or expired`);
  }

  if (token.iss !== TOKEN_ISSUER) {
    throw new UnauthorizedError("Invalid issuer");
  }

  const userId = token.sub;
  if (!userId) {
    throw new UnauthorizedError("No user id in token");
  }

  return userId;
}
