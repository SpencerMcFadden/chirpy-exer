import { Request, Response } from "express";
import { upgradeUserToChirpyRed } from "../db/queries/users.js";
import { getAPIKey } from "../auth.js";
import { config } from "../config.js";
import { UnauthorizedError } from "./errors.js";

export async function handlerUpgradeUserToChirpyRed(req: Request, res: Response) {
  type parameters = {
    event: string;
    data: { userId: string };
  };
  const headerKey = getAPIKey(req);
  if (headerKey !== config.api.polkaKey) {
    throw new UnauthorizedError("invalid api key");
  }

  const params: parameters = req.body;
  if (params.event !== "user.upgraded") {
    res.status(204).send();
    return;
  }

  const result = await upgradeUserToChirpyRed(params.data.userId);
  if (!result) {
    res.send(404).send();
    return;
  }

  res.status(204).send();
}
