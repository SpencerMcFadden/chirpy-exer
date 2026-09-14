import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "./errors.js";
import { getUserByEmail, getUserFromRefreshToken } from "../db/queries/users.js";
import { checkPasswordHash, getBearerToken, makeJWT, makeRefreshToken } from "../auth.js";
import { UserResponse } from "../db/schema.js";
import { config } from "../config.js";
import { revokeToken, saveRefreshToken } from "../db/queries/refreshTokens.js";

type LoginResponse = UserResponse & { token: string; refreshToken: string };

export async function handlerLogin(req: Request, res: Response) {
  type parameters = {
    email: string;
    password: string;
  };
  const params: parameters = req.body;

  if (!params.email) {
    throw new BadRequestError(`Email is required`);
  }
  if (!params.password) {
    throw new BadRequestError(`Password is required`);
  }

  const user = await getUserByEmail(params.email);
  const passwordMatches = await checkPasswordHash(params.password, user.hashedPassword);
  if (!passwordMatches) {
    throw new UnauthorizedError("Unauthorized");
  }

  const token = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret);
  const refresh = makeRefreshToken();

  const saved = await saveRefreshToken(user.id, refresh);
  if (!saved) {
    throw new UnauthorizedError("error saving refresh token");
  }

  const { hashedPassword, ...userResponse } = user;
  const responseWithToken = { ...userResponse, token: token, refreshToken: refresh };

  respondWithJSON(res, 200, responseWithToken satisfies LoginResponse);
}

export async function handlerRefresh(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);
  const user = await getUserFromRefreshToken(refreshToken);
  if (!user) {
    throw new UnauthorizedError("Valid refresh token not found");
  }

  const newAuthToken = makeJWT(user.users.id, config.jwt.defaultDuration, config.jwt.secret);

  respondWithJSON(res, 200, { token: newAuthToken });
}

export async function handlerRevoke(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);
  const revoked = await revokeToken(refreshToken);
  if (!revoked) {
    throw new NotFoundError("");
  }
  res.status(204).send();
}
