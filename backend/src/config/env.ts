import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  OLLAMA_BASE_URL: z.string().default("http://localhost:11434"),
  OLLAMA_MODEL: z.string().default("llama3.2:3b"),
  OLLAMA_EMBED_MODEL: z.string().default("nomic-embed-text"),
  MONGODB_URI: z.string().default("mongodb://localhost:27017"),
  MONGODB_DB_NAME: z.string().default("wikipedia_rag"),
  MONGODB_CHUNKS_COLLECTION: z.string().default("chunks"),
  MONGODB_VECTOR_INDEX: z.string().default("chunk_vector_index"),
  CHUNK_SIZE: z.coerce.number().default(2000),
  CHUNK_OVERLAP: z.coerce.number().default(200),
  RAG_TOP_K: z.coerce.number().default(5),
  RAG_MIN_SCORE: z.coerce.number().default(0.7)
});

export const env = envSchema.parse(process.env);
