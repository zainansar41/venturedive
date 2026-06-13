import type { Request, Response } from "express";
import type { RagService } from "../services/rag.js";
import type { SessionStore } from "../services/sessionStore.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

export class ChatController {
  constructor(
    private readonly rag: RagService,
    private readonly sessions: SessionStore
  ) {}

  async chat(req: Request, res: Response): Promise<void> {
    const endChat = logger.time("chat", "full chat pipeline");
    const sessionId = String(req.body?.sessionId ?? "").trim();
    const message = String(req.body?.message ?? "").trim();

    if (!sessionId || !message) {
      throw new ValidationError("sessionId and message are required");
    }

    logger.info("chat", "Received chat request", {
      sessionId,
      messageLength: message.length
    });

    if (!this.sessions.has(sessionId)) {
      logger.warn("chat", "Session not found", { sessionId });
      throw new NotFoundError("Session not found. Please ingest an article first.");
    }

    const session = this.sessions.get(sessionId);
    logger.info("chat", "Session found", {
      sessionId,
      title: session?.title
    });

    const result = await this.rag.ask(sessionId, message);

    logger.info("chat", "Chat completed", {
      sessionId,
      answerLength: result.answer.length,
      sourceCount: result.sources.length
    });
    endChat();

    res.status(200).json(result);
  }
}
