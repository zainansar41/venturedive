import { describe, expect, it } from "vitest";
import { ChunkerService } from "../src/services/chunker.js";
describe("ChunkerService", () => {
    it("chunks long section text with overlap", () => {
        const chunker = new ChunkerService({ chunkSize: 20, overlap: 5 });
        const chunks = chunker.chunkSections([{ title: "History", content: "abcdefghijklmnopqrstuvwxyz0123456789" }], "https://en.wikipedia.org/wiki/Test");
        expect(chunks.length).toBeGreaterThan(1);
        expect(chunks[0].metadata.sectionTitle).toBe("History");
        expect(chunks[0].metadata.sourceUrl).toContain("wikipedia");
    });
});
