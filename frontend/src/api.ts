import type { ApiError, ChatResponse, IngestResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

function log(scope: string, message: string, meta?: Record<string, unknown>): void {
  console.log(`[frontend:${scope}] ${message}`, meta ?? "");
}

async function parseOrThrow<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & ApiError;
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export async function ingestArticle(url: string): Promise<IngestResponse> {
  const start = performance.now();
  log("api", "Ingest request started", { url });

  try {
    const response = await fetch(`${API_BASE_URL}/api/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const result = await parseOrThrow<IngestResponse>(response);
    log("api", "Ingest request completed", {
      durationMs: Math.round(performance.now() - start),
      sessionId: result.sessionId,
      title: result.title
    });
    return result;
  } catch (error) {
    log("api", "Ingest request failed", {
      durationMs: Math.round(performance.now() - start),
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

export async function askQuestion(
  sessionId: string,
  message: string
): Promise<ChatResponse> {
  const start = performance.now();
  log("api", "Chat request started", { sessionId, messageLength: message.length });

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message })
    });

    const result = await parseOrThrow<ChatResponse>(response);
    log("api", "Chat request completed", {
      durationMs: Math.round(performance.now() - start),
      sourceCount: result.sources.length,
      answerLength: result.answer.length
    });
    return result;
  } catch (error) {
    log("api", "Chat request failed", {
      durationMs: Math.round(performance.now() - start),
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}
