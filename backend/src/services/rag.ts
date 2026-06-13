import type { EmbeddingsProvider, LlmProvider, VectorStore } from "../types/contracts.js";
import type { ScoredChunk } from "../types/domain.js";
import { logger } from "../utils/logger.js";

interface RagServiceOptions {
  topK: number;
  minScore: number;
}

export class RagService {
  constructor(
    private readonly embeddings: EmbeddingsProvider,
    private readonly llm: LlmProvider,
    private readonly vectorStore: VectorStore,
    private readonly options: RagServiceOptions
  ) {}

  async ask(sessionId: string, message: string): Promise<{
    answer: string;
    sources: Array<{ sectionTitle: string; snippet: string }>;
  }> {
    logger.info("rag", "Starting RAG query", {
      sessionId,
      topK: this.options.topK,
      minScore: this.options.minScore,
      messageLength: message.length
    });

    const endEmbed = logger.time("rag", "embed query");
    const [queryEmbedding] = await this.embeddings.embed([message]);
    endEmbed();

    const endSearch = logger.time("rag", "vector search");
    const candidates = await this.vectorStore.vectorSearch(
      sessionId,
      queryEmbedding,
      this.options.topK
    );
    endSearch();

    logger.info("rag", "Vector search results", {
      sessionId,
      candidateCount: candidates.length,
      scores: candidates.map((chunk) => ({
        section: chunk.metadata.sectionTitle,
        score: Number(chunk.score.toFixed(4))
      }))
    });

    const relevant = candidates.filter((chunk) => chunk.score >= this.options.minScore);
    if (relevant.length === 0) {
      logger.warn("rag", "No relevant chunks above threshold", {
        sessionId,
        minScore: this.options.minScore
      });
      return {
        answer: "I cannot find that information in the article.",
        sources: []
      };
    }

    logger.info("rag", "Relevant chunks selected", {
      sessionId,
      relevantCount: relevant.length,
      sections: relevant.map((chunk) => chunk.metadata.sectionTitle)
    });

    const system = [
      "You are a helpful assistant that answers questions about a Wikipedia article.",
      "Answer ONLY using the provided context excerpts. Do not use outside knowledge.",
      'If context is insufficient, answer exactly: "I cannot find that information in the article."',
      "Keep answers concise and factual."
    ].join(" ");

    const context = relevant
      .map(
        (chunk, index) =>
          `[Source ${index + 1} - ${chunk.metadata.sectionTitle}]\n${chunk.text}`
      )
      .join("\n\n---\n\n");

    const userPrompt = `Context:\n${context}\n\nQuestion: ${message}`;

    const endGenerate = logger.time("rag", "generate answer");
    const answer = await this.llm.chat(system, userPrompt);
    endGenerate();

    logger.info("rag", "Answer generated", {
      sessionId,
      answerLength: answer.length
    });

    return {
      answer,
      sources: this.toSources(relevant)
    };
  }

  private toSources(chunks: ScoredChunk[]): Array<{ sectionTitle: string; snippet: string }> {
    return chunks.map((chunk) => ({
      sectionTitle: chunk.metadata.sectionTitle,
      snippet: chunk.text.slice(0, 240)
    }));
  }
}
