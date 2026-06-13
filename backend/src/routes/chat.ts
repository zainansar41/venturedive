import { Router } from "express";
import type { ChatController } from "../controllers/chatController.js";

export function createChatRouter(controller: ChatController): Router {
  const router = Router();
  router.post("/", async (req, res, next) => {
    try {
      await controller.chat(req, res);
    } catch (error) {
      next(error);
    }
  });
  return router;
}
