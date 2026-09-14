import { hash, verify } from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { BadRequestError, UnauthorizedError } from "./api/errors.js";
import { Request } from "express";
import { config } from "./config.js";

type payload = Pick<jwt.JwtPayload, "iss" | "sub" | "iat" | "exp">;

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
    iss: config.jwt.issuer,
    sub: userID,
    iat: now,
    exp: expires,
  };
  return jwt.sign(payload, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
  let token: payload;
  try {
    token = jwt.verify(tokenString, secret) as jwt.JwtPayload;
  } catch (error) {
    throw new UnauthorizedError(`Token is invalid or expired`);
  }

  if (token.iss !== config.jwt.issuer) {
    throw new UnauthorizedError("Invalid issuer");
  }

  const userId = token.sub;
  if (!userId) {
    throw new UnauthorizedError("No user id in token");
  }

  return userId;
}

export function getBearerToken(req: Request): string {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new BadRequestError("Bearer header not found");
  }
  const token = extractTokenFromAuthHeader(authHeader);
  return token;
}

export function extractTokenFromAuthHeader(header: string): string {
  const split = header.split(" ");
  if (split.length < 2 || split[0] !== "Bearer") {
    throw new BadRequestError("Bearer header not found");
  }
  return split[1];
}

export function makeRefreshToken() {
  return crypto.randomBytes(32).toString("hex");
}
