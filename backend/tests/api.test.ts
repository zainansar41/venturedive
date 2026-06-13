import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildApp } from "../src/app.js";
import { ChatController } from "../src/controllers/chatController.js";
import { IngestController } from "../src/controllers/ingestController.js";
import { ChunkerService } from "../src/services/chunker.js";
import { RagService } from "../src/services/rag.js";
import { SessionStore } from "../src/services/sessionStore.js";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("error middleware", () => {
  it("returns 404 for unknown session on chat", async () => {
    const sessions = new SessionStore();
    const ingestController = new IngestController(
      {
        fetchArticle: async () => ({
          title: "Node.js",
          url: "https://en.wikipedia.org/wiki/Node.js",
          sections: [{ title: "History", content: "Node history from article" }],
          text: "Node history from article"
        })
      },
      { summarise: async () => "Node summary", chat: async () => "Node summary" },
      new ChunkerService({ chunkSize: 100, overlap: 10 }),
      { dimensions: 3, embed: async () => [[0.1, 0.2, 0.3]] },
      {
        ensureIndex: async () => undefined,
        insertChunks: async () => undefined,
        vectorSearch: async () => [],
        deleteBySession: async () => undefined
      },
      sessions
    );
    const chatController = new ChatController(
      new RagService(
        { dimensions: 3, embed: async () => [[0.1, 0.2, 0.3]] },
        { summarise: async () => "summary", chat: async () => "Ryan Dahl created Node.js." },
        {
          ensureIndex: async () => undefined,
          insertChunks: async () => undefined,
          vectorSearch: async () => [],
          deleteBySession: async () => undefined
        },
        { topK: 5, minScore: 0.7 }
      ),
      sessions
    );
    const app = buildApp(ingestController, chatController);
    const response = await request(app)
      .post("/api/chat")
      .send({ sessionId: "missing", message: "Who?" });
    expect(response.status).toBe(404);
  });
});

describe("API routes", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("responds to health endpoint", async () => {
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("/api/chat")) {
        return new Response(JSON.stringify({ message: { content: "summary" } }), { status: 200 });
      }
      if (url.includes("/api/embeddings")) {
        return new Response(JSON.stringify({ embedding: [0.1, 0.2, 0.3] }), { status: 200 });
      }
      return new Response("<h1>Node.js</h1><section><h2>History</h2><p>Node.js is runtime.</p></section>", {
        status: 200
      });
    });

    const sessions = new SessionStore();
    sessions.set({
      sessionId: "seed",
      title: "Node.js",
      summary: "summary",
      url: "https://en.wikipedia.org/wiki/Node.js",
      createdAt: new Date()
    });

    const ingestController = new IngestController(
      {
        fetchArticle: async () => ({
          title: "Node.js",
          url: "https://en.wikipedia.org/wiki/Node.js",
          sections: [{ title: "History", content: "Node history" }],
          text: "Node history"
        })
      },
      { summarise: async () => "summary", chat: async () => "chat" },
      new ChunkerService({ chunkSize: 50, overlap: 10 }),
      { dimensions: 3, embed: async () => [[0.1, 0.2, 0.3]] },
      {
        ensureIndex: async () => undefined,
        insertChunks: async () => undefined,
        vectorSearch: async () => [],
        deleteBySession: async () => undefined
      },
      sessions
    );

    const chatController = new ChatController(
      new RagService(
        { dimensions: 3, embed: async () => [[0.1, 0.2, 0.3]] },
        { summarise: async () => "summary", chat: async () => "answer" },
        {
          ensureIndex: async () => undefined,
          insertChunks: async () => undefined,
          vectorSearch: async () => [],
          deleteBySession: async () => undefined
        },
        { topK: 5, minScore: 0.7 }
      ),
      sessions
    );

    const app = buildApp(ingestController, chatController);
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("handles ingest and chat endpoints", async () => {
    const sessions = new SessionStore();
    const ingestController = new IngestController(
      {
        fetchArticle: async () => ({
          title: "Node.js",
          url: "https://en.wikipedia.org/wiki/Node.js",
          sections: [{ title: "History", content: "Node history from article" }],
          text: "Node history from article"
        })
      },
      { summarise: async () => "Node summary", chat: async () => "Node summary" },
      new ChunkerService({ chunkSize: 100, overlap: 10 }),
      { dimensions: 3, embed: async () => [[0.1, 0.2, 0.3]] },
      {
        ensureIndex: async () => undefined,
        insertChunks: async () => undefined,
        vectorSearch: async () => [
          {
            id: "c1",
            text: "Node was created by Ryan Dahl",
            metadata: {
              sectionTitle: "History",
              chunkIndex: 0,
              sourceUrl: "https://en.wikipedia.org/wiki/Node.js"
            },
            score: 0.9
          }
        ],
        deleteBySession: async () => undefined
      },
      sessions
    );
    const chatController = new ChatController(
      new RagService(
        { dimensions: 3, embed: async () => [[0.1, 0.2, 0.3]] },
        { summarise: async () => "summary", chat: async () => "Ryan Dahl created Node.js." },
        {
          ensureIndex: async () => undefined,
          insertChunks: async () => undefined,
          vectorSearch: async () => [
            {
              id: "c1",
              text: "Node was created by Ryan Dahl",
              metadata: {
                sectionTitle: "History",
                chunkIndex: 0,
                sourceUrl: "https://en.wikipedia.org/wiki/Node.js"
              },
              score: 0.9
            }
          ],
          deleteBySession: async () => undefined
        },
        { topK: 5, minScore: 0.7 }
      ),
      sessions
    );
    const app = buildApp(ingestController, chatController);

    const ingestRes = await request(app)
      .post("/api/ingest")
      .send({ url: "https://en.wikipedia.org/wiki/Node.js" });
    expect(ingestRes.status).toBe(200);
    expect(ingestRes.body.sessionId).toBeTypeOf("string");

    const chatRes = await request(app).post("/api/chat").send({
      sessionId: ingestRes.body.sessionId,
      message: "Who created Node.js?"
    });
    expect(chatRes.status).toBe(200);
    expect(chatRes.body.answer).toContain("Ryan Dahl");
  });
});
