import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";

export async function handlerValidate(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  const params: parameters = req.body;

  const maxChirpLength = 140;
  if (params.body.length > maxChirpLength) {
    throw new BadRequestError(`Chirp is too long. Max length is ${maxChirpLength}`);
  }

  const profanities = ["kerfuffle", "sharbert", "fornax"];
  const profaneCheck = params.body.split(" ");
  for (const wordIndex in profaneCheck) {
    if (profanities.includes(profaneCheck[wordIndex].toLowerCase())) {
      profaneCheck[wordIndex] = "****";
    }
  }
  const cleaned = profaneCheck.join(" ");

  respondWithJSON(res, 200, {
    cleanedBody: cleaned,
  });
}
