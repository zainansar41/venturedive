import type { Chunk, Section } from "../types/domain.js";

interface ChunkOptions {
  chunkSize: number;
  overlap: number;
}

export class ChunkerService {
  constructor(private readonly options: ChunkOptions) {}

  chunkSections(sections: Section[], sourceUrl: string): Chunk[] {
    const chunks: Chunk[] = [];
    let globalIndex = 0;

    for (const section of sections) {
      if (!section.content.trim()) {
        continue;
      }

      const sectionChunks = this.splitWithOverlap(section.content);
      sectionChunks.forEach((text, index) => {
        chunks.push({
          id: `${section.title || "section"}-${globalIndex}`,
          text,
          metadata: {
            sectionTitle: section.title || "Article",
            chunkIndex: index,
            sourceUrl
          }
        });
        globalIndex += 1;
      });
    }

    return chunks;
  }

  private splitWithOverlap(text: string): string[] {
    const cleaned = text.replace(/\s+/g, " ").trim();
    if (!cleaned) return [];

    const { chunkSize, overlap } = this.options;
    if (cleaned.length <= chunkSize) {
      return [cleaned];
    }

    const chunks: string[] = [];
    let start = 0;

    while (start < cleaned.length) {
      const end = Math.min(start + chunkSize, cleaned.length);
      chunks.push(cleaned.slice(start, end).trim());
      if (end >= cleaned.length) break;
      start = Math.max(0, end - overlap);
    }

    return chunks.filter(Boolean);
  }
}
