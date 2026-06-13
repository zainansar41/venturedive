import { describe, expect, it, vi } from "vitest";
import { OllamaEmbeddingsService } from "../src/services/ollamaEmbeddings.js";
import { OllamaLlmService } from "../src/services/ollamaLlm.js";

describe("Ollama services", () => {
  it("summarise and chat parse successful responses", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ message: { content: "ok answer" } }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    const service = new OllamaLlmService({
      baseUrl: "http://localhost:11434",
      model: "llama3.2:3b"
    });

    const summary = await service.summarise("text");
    expect(summary).toBe("ok answer");
  });

  it("embeddings service returns vectors", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ embedding: [1, 2, 3] }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    const service = new OllamaEmbeddingsService({
      baseUrl: "http://localhost:11434",
      model: "nomic-embed-text"
    });

    const vectors = await service.embed(["hello"]);
    expect(vectors[0]).toEqual([1, 2, 3]);
  });
});
