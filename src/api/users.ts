import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";
import { createUser, updateUser } from "../db/queries/users.js";
import { getBearerToken, hashPassword, validateJWT } from "../auth.js";
import { User, UserResponse } from "../db/schema.js";
import { config } from "../config.js";

export async function handlerCreateUser(req: Request, res: Response) {
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
  const password = await hashPassword(params.password);
  const newUser = await createUser({
    email: params.email,
    hashedPassword: password,
  } satisfies User);
  if (!newUser) {
    throw new Error("Could not create user");
  }
  const { hashedPassword, ...userResponse } = newUser;

  respondWithJSON(res, 201, userResponse satisfies UserResponse);
}

export async function handlerUpdateUser(req: Request, res: Response) {
  type parameters = {
    email: string;
    password: string;
  };
  const params: parameters = req.body;
  const refreshToken = getBearerToken(req);
  const userId = validateJWT(refreshToken, config.jwt.secret);

  if (!params.email) {
    throw new BadRequestError(`Email is required`);
  }
  if (!params.password) {
    throw new BadRequestError(`Password is required`);
  }
  const password = await hashPassword(params.password);
  const updatedUser = await updateUser(userId, params.email, password);
  if (!updatedUser) {
    throw new Error("Could not update user");
  }
  const { hashedPassword, ...userResponse } = updatedUser;

  respondWithJSON(res, 200, userResponse satisfies UserResponse);
}
