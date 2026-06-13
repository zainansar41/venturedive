import type { Article, Chunk, ScoredChunk } from "./domain.js";

export interface LlmProvider {
  summarise(text: string): Promise<string>;
  chat(system: string, user: string): Promise<string>;
}

export interface EmbeddingsProvider {
  readonly dimensions: number;
  embed(texts: string[]): Promise<number[][]>;
}

export interface VectorStore {
  ensureIndex(): Promise<void>;
  insertChunks(sessionId: string, chunks: Chunk[]): Promise<void>;
  vectorSearch(
    sessionId: string,
    vector: number[],
    topK: number
  ): Promise<ScoredChunk[]>;
  deleteBySession(sessionId: string): Promise<void>;
}

export interface Scraper {
  fetchArticle(url: string): Promise<Article>;
}
