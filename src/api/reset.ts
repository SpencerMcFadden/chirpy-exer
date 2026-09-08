import { Request, Response } from "express";
import { config } from "../config.js";

export function handlerReset(_: Request, res: Response) {
  res.set({
    "Content-Type": "text/plain; charset=utf-8",
  });
  config.fileserverHits = 0;
  res.send(`Server hits have been reset. Hits: ${config.fileserverHits}`);
}
