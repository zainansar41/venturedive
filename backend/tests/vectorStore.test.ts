import { describe, expect, it, vi } from "vitest";
import { MongoVectorStore } from "../src/services/vectorStore.js";

describe("MongoVectorStore", () => {
  it("inserts and searches chunk documents", async () => {
    const collection = {
      createSearchIndex: vi.fn(async () => "ok"),
      deleteMany: vi.fn(async () => ({ acknowledged: true })),
      insertMany: vi.fn(async () => ({ acknowledged: true })),
      aggregate: vi.fn(() => ({
        toArray: async () => [
          {
            chunkId: "c1",
            text: "Node text",
            metadata: {
              sectionTitle: "History",
              chunkIndex: 0,
              sourceUrl: "https://en.wikipedia.org/wiki/Node.js"
            },
            score: 0.99
          }
        ]
      }))
    };

    const store = new MongoVectorStore({
      collection: collection as never,
      indexName: "idx",
      dimensions: 3
    });

    await store.ensureIndex();
    await store.insertChunks("s1", [
      {
        id: "c1",
        text: "Node text",
        vector: [0.1, 0.2, 0.3],
        metadata: {
          sectionTitle: "History",
          chunkIndex: 0,
          sourceUrl: "https://en.wikipedia.org/wiki/Node.js"
        }
      }
    ]);
    const result = await store.vectorSearch("s1", [0.1, 0.2, 0.3], 3);
    expect(result[0].score).toBeGreaterThan(0.9);
  });
});
