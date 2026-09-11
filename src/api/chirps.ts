import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";
import { createChirp, getChirps } from "../db/queries/chirps.js";

export async function handlerCreateChirp(req: Request, res: Response) {
  type parameters = {
    body: string;
    userId: string;
  };

  const params: parameters = req.body;
  const cleaned = validateChirp(params.body);

  const newChirp = await createChirp({ body: cleaned, userId: params.userId });

  respondWithJSON(res, 201, newChirp);
}

export async function handlerGetChirps(_: Request, res: Response) {
  const chirps = await getChirps();
  respondWithJSON(res, 200, chirps);
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
