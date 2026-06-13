import { Router } from "express";
import type { IngestController } from "../controllers/ingestController.js";

export function createIngestRouter(controller: IngestController): Router {
  const router = Router();
  router.post("/", async (req, res, next) => {
    try {
      await controller.ingest(req, res);
    } catch (error) {
      next(error);
    }
  });
  return router;
}
