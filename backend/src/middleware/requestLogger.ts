import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = performance.now();

  res.on("finish", () => {
    const durationMs = Math.round(performance.now() - start);
    logger.info("http", `${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      durationMs
    });
  });

  next();
}
