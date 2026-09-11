import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import { getUserByEmail } from "../db/queries/users.js";
import { checkPasswordHash } from "../auth.js";
import { UserResponse } from "../db/schema.js";

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

  const { hashedPassword, ...userResponse } = user;

  respondWithJSON(res, 200, userResponse satisfies UserResponse);
}
