import { Router } from "express";
import { healthController } from "../controllers/healthController.js";

export function createHealthRouter(): Router {
  const router = Router();
  router.get("/", healthController);
  return router;
}
