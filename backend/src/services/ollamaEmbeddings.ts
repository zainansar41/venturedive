import type { EmbeddingsProvider } from "../types/contracts.js";
import { ServiceUnavailableError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

interface OllamaEmbeddingsOptions {
  baseUrl: string;
  model: string;
  dimensions?: number;
}

export class OllamaEmbeddingsService implements EmbeddingsProvider {
  readonly dimensions: number;

  constructor(private readonly options: OllamaEmbeddingsOptions) {
    this.dimensions = options.dimensions ?? 768;
  }

  async embed(texts: string[]): Promise<number[][]> {
    const endEmbed = logger.time("ollama-embed", "embed all texts");
    logger.info("ollama-embed", "Starting embedding batch", {
      model: this.options.model,
      count: texts.length
    });

    const vectors: number[][] = [];

    for (let index = 0; index < texts.length; index += 1) {
      const text = texts[index];
      const endSingle = logger.time("ollama-embed", `embed chunk ${index + 1}/${texts.length}`);
      try {
        const response = await fetch(`${this.options.baseUrl}/api/embeddings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: this.options.model,
            prompt: text
          })
        });

        if (!response.ok) {
          logger.error("ollama-embed", "Embedding request failed", {
            index: index + 1,
            status: response.status
          });
          throw new ServiceUnavailableError(
            "LLM service unavailable. Please try again."
          );
        }

        const data = (await response.json()) as { embedding?: number[] };
        vectors.push(data.embedding ?? []);
        endSingle();
      } catch (error) {
        if (error instanceof ServiceUnavailableError) throw error;
        logger.error("ollama-embed", "Embedding error", {
          index: index + 1,
          error: error instanceof Error ? error.message : String(error)
        });
        throw new ServiceUnavailableError(
          "LLM service unavailable. Please try again."
        );
      }
    }

    endEmbed();
    logger.info("ollama-embed", "Embedding batch complete", {
      vectorCount: vectors.length,
      dimensions: vectors[0]?.length ?? 0
    });
    return vectors;
  }
}
