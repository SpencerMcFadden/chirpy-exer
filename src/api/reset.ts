import { Request, Response } from "express";
import { config } from "../config.js";
import { ForbiddenError } from "./errors.js";
import { deleteUsers } from "../db/queries/users.js";

export async function handlerReset(_: Request, res: Response) {
  if (config.api.platform !== "dev") {
    throw new ForbiddenError(`Unauthorized when not on dev`);
  }

  res.set({
    "Content-Type": "text/plain; charset=utf-8",
  });
  config.api.fileserverHits = 0;
  await deleteUsers();
  res.send(`Server hits and Users have been reset. Hits: ${config.api.fileserverHits}`);
}
