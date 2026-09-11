import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";
import { createUser } from "../db/queries/users.js";
import { hashPassword } from "../auth.js";
import { User, UserResponse } from "../db/schema.js";

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
