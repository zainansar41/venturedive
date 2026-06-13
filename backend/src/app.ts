import cors from "cors";
import express from "express";
import { ChatController } from "./controllers/chatController.js";
import { IngestController } from "./controllers/ingestController.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { logger } from "./utils/logger.js";
import { ChunkerService } from "./services/chunker.js";
import { MongoService } from "./services/mongodb.js";
import { OllamaEmbeddingsService } from "./services/ollamaEmbeddings.js";
import { OllamaLlmService } from "./services/ollamaLlm.js";
import { RagService } from "./services/rag.js";
import { WikipediaScraperService } from "./services/scraper.js";
import { SessionStore } from "./services/sessionStore.js";
import { MongoVectorStore } from "./services/vectorStore.js";
import { createChatRouter } from "./routes/chat.js";
import { createHealthRouter } from "./routes/health.js";
import { createIngestRouter } from "./routes/ingest.js";

export function buildApp(
  ingestController: IngestController,
  chatController: ChatController
) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.use("/api/health", createHealthRouter());
  app.use("/api/ingest", createIngestRouter(ingestController));
  app.use("/api/chat", createChatRouter(chatController));

  app.use(errorHandler);

  return app;
}

export async function createRuntimeApp() {
  logger.info("bootstrap", "Starting backend runtime", {
    port: env.PORT,
    ollamaBaseUrl: env.OLLAMA_BASE_URL,
    ollamaModel: env.OLLAMA_MODEL,
    embedModel: env.OLLAMA_EMBED_MODEL,
    mongodbUri: env.MONGODB_URI,
    dbName: env.MONGODB_DB_NAME
  });

  const endConnect = logger.time("mongodb", "connect");
  const mongo = new MongoService(
    env.MONGODB_URI,
    env.MONGODB_DB_NAME,
    env.MONGODB_CHUNKS_COLLECTION
  );
  await mongo.connect();
  endConnect();

  const llm = new OllamaLlmService({
    baseUrl: env.OLLAMA_BASE_URL,
    model: env.OLLAMA_MODEL
  });

  const embeddings = new OllamaEmbeddingsService({
    baseUrl: env.OLLAMA_BASE_URL,
    model: env.OLLAMA_EMBED_MODEL
  });

  const vectorStore = new MongoVectorStore({
    collection: mongo.getChunksCollection(),
    indexName: env.MONGODB_VECTOR_INDEX,
    dimensions: embeddings.dimensions
  });
  const endIndex = logger.time("vectorStore", "ensure vector search index");
  await vectorStore.ensureIndex();
  endIndex();
  logger.info("bootstrap", "Backend services initialized");

  const scraper = new WikipediaScraperService();
  const chunker = new ChunkerService({
    chunkSize: env.CHUNK_SIZE,
    overlap: env.CHUNK_OVERLAP
  });
  const sessions = new SessionStore();
  const rag = new RagService(embeddings, llm, vectorStore, {
    topK: env.RAG_TOP_K,
    minScore: env.RAG_MIN_SCORE
  });

  const ingestController = new IngestController(
    scraper,
    llm,
    chunker,
    embeddings,
    vectorStore,
    sessions
  );
  const chatController = new ChatController(rag, sessions);

  return { app: buildApp(ingestController, chatController), mongo };
}
