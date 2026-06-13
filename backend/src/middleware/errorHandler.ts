import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof AppError) {
    logger.warn("error", "Handled application error", {
      method: req.method,
      path: req.originalUrl,
      statusCode: error.statusCode,
      message: error.message
    });
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  logger.error("error", "Unhandled server error", {
    method: req.method,
    path: req.originalUrl,
    error: error instanceof Error ? error.message : String(error)
  });
  res.status(500).json({ error: "Internal server error" });
}
