import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { respondWithError } from "./json.js";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors.js";

export function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    const statusCode = res.statusCode;
    if (statusCode !== 200) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
    }
  });
  next();
}

export function middlewareMetricsInc(_: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    config.api.fileserverHits += 1;
  });
  next();
}

export function middlewareErrorHandler(err: Error, _: Request, res: Response, __: NextFunction) {
  let message = "Something went wrong on our end";
  let statusCode = 500;

  if (err instanceof BadRequestError) {
    message = err.message;
    statusCode = 400;
  } else if (err instanceof UnauthorizedError) {
    message = err.message;
    statusCode = 401;
  } else if (err instanceof ForbiddenError) {
    message = err.message;
    statusCode = 403;
  } else if (err instanceof NotFoundError) {
    message = err.message;
    statusCode = 404;
  }

  console.log(err.message);
  respondWithError(res, statusCode, message);
}
