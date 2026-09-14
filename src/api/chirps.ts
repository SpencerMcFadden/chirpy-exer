import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors.js";
import { createChirp, deleteChirpById, getChirpById, getChirps } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";

export async function handlerCreateChirp(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  const params: parameters = req.body;
  const userToken = getBearerToken(req);
  const userId = validateJWT(userToken, config.jwt.secret);
  const cleaned = validateChirp(params.body);

  const newChirp = await createChirp({ body: cleaned, userId: userId });

  respondWithJSON(res, 201, newChirp);
}

export async function handlerGetChirps(_: Request, res: Response) {
  const chirps = await getChirps();
  respondWithJSON(res, 200, chirps);
}

export async function handlerGetChirpById(req: Request, res: Response) {
  const chirpId = req.params.chirpId;
  if (typeof chirpId !== "string") {
    throw new BadRequestError(`Something is wrong with the id type: ${typeof chirpId}`);
  }
  const chirp = await getChirpById(chirpId);
  if (!chirp) {
    throw new NotFoundError(`Chirp with id "${chirpId}" not found`);
  }
  respondWithJSON(res, 200, chirp);
}

export async function handlerDeleteChirpById(req: Request, res: Response) {
  const chirpId = req.params.chirpId;
  if (typeof chirpId !== "string") {
    throw new BadRequestError(`Something is wrong with the id type: ${typeof chirpId}`);
  }

  const userToken = getBearerToken(req);
  const userId = validateJWT(userToken, config.jwt.secret);

  const chirp = await getChirpById(chirpId);
  if (!chirp) {
    throw new NotFoundError(`Chirp with id "${chirpId}" not found`);
  }
  if (chirp.userId !== userId) {
    throw new ForbiddenError(`Chirp ${chirpId} is not yours`);
  }

  const deleted = await deleteChirpById(chirpId);
  if (!deleted) {
    throw new BadRequestError(`Something went wrong when trying to delete chirp ${chirpId}`);
  }

  res.status(204).send();
}

function validateChirp(body: string) {
  const maxChirpLength = 140;
  if (body.length > maxChirpLength) {
    throw new BadRequestError(`Chirp is too long. Max length is ${maxChirpLength}`);
  }

  const profanities = ["kerfuffle", "sharbert", "fornax"];
  const profaneCheck = body.split(" ");
  for (const wordIndex in profaneCheck) {
    if (profanities.includes(profaneCheck[wordIndex].toLowerCase())) {
      profaneCheck[wordIndex] = "****";
    }
  }
  const cleaned = profaneCheck.join(" ");
  return cleaned;
}
