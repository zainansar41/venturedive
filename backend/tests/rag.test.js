import { describe, expect, it } from "vitest";
import { RagService } from "../src/services/rag.js";
describe("RagService", () => {
    it("returns fallback answer when no relevant chunks", async () => {
        const rag = new RagService({
            dimensions: 3,
            embed: async () => [[0.1, 0.2, 0.3]]
        }, {
            summarise: async () => "summary",
            chat: async () => "answer"
        }, {
            ensureIndex: async () => undefined,
            insertChunks: async () => undefined,
            deleteBySession: async () => undefined,
            vectorSearch: async () => []
        }, { topK: 5, minScore: 0.7 });
        const result = await rag.ask("session", "who created node");
        expect(result.answer).toContain("cannot find");
        expect(result.sources).toEqual([]);
    });
});
