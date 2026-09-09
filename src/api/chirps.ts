import { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";

export function handlerValidate(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  const params: parameters = req.body;

  const maxChirpLength = 140;
  if (params.body.length > maxChirpLength) {
    respondWithError(res, 400, "Chirp is too long");
    return;
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
