import { v4 as uuidv4 } from "uuid";
import type { Request, Response } from "express";
import type { ChunkerService } from "../services/chunker.js";
import type { EmbeddingsProvider, LlmProvider, Scraper, VectorStore } from "../types/contracts.js";
import type { SessionStore } from "../services/sessionStore.js";
import { validateWikipediaUrl } from "../utils/validators.js";
import { ValidationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

export class IngestController {
  constructor(
    private readonly scraper: Scraper,
    private readonly llm: LlmProvider,
    private readonly chunker: ChunkerService,
    private readonly embeddings: EmbeddingsProvider,
    private readonly vectorStore: VectorStore,
    private readonly sessions: SessionStore
  ) {}

  async ingest(req: Request, res: Response): Promise<void> {
    const endIngest = logger.time("ingest", "full ingest pipeline");
    const url = String(req.body?.url ?? "").trim();
    if (!url) {
      throw new ValidationError("URL must be a valid Wikipedia article link");
    }

    logger.info("ingest", "Received ingest request", { url });
    validateWikipediaUrl(url);

    const endScrape = logger.time("ingest", "scrape article");
    const article = await this.scraper.fetchArticle(url);
    endScrape();

    const sessionId = uuidv4();
    logger.info("ingest", "Article scraped", {
      sessionId,
      title: article.title,
      sectionCount: article.sections.length,
      textLength: article.text.length
    });

    const endSummarise = logger.time("ingest", "summarise + chunk (parallel)");
    const [summary, rawChunks] = await Promise.all([
      this.llm.summarise(article.text),
      Promise.resolve(this.chunker.chunkSections(article.sections, article.url))
    ]);
    endSummarise();

    logger.info("ingest", "Summary and chunks ready", {
      sessionId,
      chunkCount: rawChunks.length,
      summaryLength: summary.length
    });

    const endEmbed = logger.time("ingest", "embed chunks");
    const vectors = await this.embeddings.embed(rawChunks.map((chunk) => chunk.text));
    endEmbed();

    const chunks = rawChunks.map((chunk, index) => ({
      ...chunk,
      vector: vectors[index]
    }));

    const endStore = logger.time("ingest", "store chunks in MongoDB");
    await this.vectorStore.insertChunks(sessionId, chunks);
    endStore();

    this.sessions.set({
      sessionId,
      title: article.title,
      summary,
      url: article.url,
      createdAt: new Date()
    });

    logger.info("ingest", "Ingest completed successfully", {
      sessionId,
      title: article.title,
      chunkCount: chunks.length
    });
    endIngest();

    res.status(200).json({
      sessionId,
      title: article.title,
      summary
    });
  }
}
