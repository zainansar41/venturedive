import type { LlmProvider } from "../types/contracts.js";
import { ServiceUnavailableError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

interface OllamaLlmOptions {
  baseUrl: string;
  model: string;
}

export class OllamaLlmService implements LlmProvider {
  constructor(private readonly options: OllamaLlmOptions) {}

  async summarise(text: string): Promise<string> {
    const inputLength = text.slice(0, 12000).length;
    logger.info("ollama-llm", "Summarising article", {
      model: this.options.model,
      inputLength
    });

    const prompt = `Summarize the following Wikipedia article in 5-8 concise bullet points:\n\n${text.slice(0, 12000)}`;
    const summary = await this.chat(
      "You are a concise and factual summarization assistant.",
      prompt
    );

    logger.info("ollama-llm", "Summary generated", {
      summaryLength: summary.length
    });
    return summary;
  }

  async chat(system: string, user: string): Promise<string> {
    const endChat = logger.time("ollama-llm", "Ollama chat request");
    try {
      logger.info("ollama-llm", "Calling Ollama /api/chat", {
        model: this.options.model,
        systemLength: system.length,
        userLength: user.length
      });

      const response = await fetch(`${this.options.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.options.model,
          stream: false,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user }
          ]
        })
      });

      if (!response.ok) {
        logger.error("ollama-llm", "Ollama chat request failed", {
          status: response.status,
          model: this.options.model
        });
        throw new ServiceUnavailableError(
          "LLM service unavailable. Please try again."
        );
      }

      const data = (await response.json()) as { message?: { content?: string } };
      const content = data.message?.content?.trim() || "";
      endChat();
      logger.info("ollama-llm", "Ollama chat response received", {
        responseLength: content.length
      });
      return content;
    } catch (error) {
      if (error instanceof ServiceUnavailableError) throw error;
      logger.error("ollama-llm", "Ollama chat error", {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new ServiceUnavailableError("LLM service unavailable. Please try again.");
    }
  }
}
