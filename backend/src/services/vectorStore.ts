import type { Collection, Document } from "mongodb";
import type { VectorStore } from "../types/contracts.js";
import type { Chunk, ScoredChunk } from "../types/domain.js";
import type { ChunkDocument } from "./mongodb.js";
import { ServiceUnavailableError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

interface MongoVectorStoreOptions {
  collection: Collection<ChunkDocument>;
  indexName: string;
  dimensions: number;
}

export class MongoVectorStore implements VectorStore {
  constructor(private readonly options: MongoVectorStoreOptions) {}

  async ensureIndex(): Promise<void> {
    try {
      logger.info("vectorStore", "Creating vector search index", {
        indexName: this.options.indexName,
        dimensions: this.options.dimensions
      });
      await this.options.collection.createSearchIndex({
        name: this.options.indexName,
        type: "vectorSearch",
        definition: {
          fields: [
            {
              type: "vector",
              path: "embedding",
              numDimensions: this.options.dimensions,
              similarity: "cosine"
            },
            {
              type: "filter",
              path: "sessionId"
            }
          ]
        }
      });
      logger.info("vectorStore", "Vector search index ready", {
        indexName: this.options.indexName
      });
    } catch (error) {
      logger.warn("vectorStore", "Vector index creation skipped or already exists", {
        indexName: this.options.indexName,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async insertChunks(sessionId: string, chunks: Chunk[]): Promise<void> {
    logger.info("vectorStore", "Inserting chunks", {
      sessionId,
      chunkCount: chunks.length
    });

    const endDelete = logger.time("vectorStore", "delete existing session chunks");
    await this.deleteBySession(sessionId);
    endDelete();

    const docs: ChunkDocument[] = chunks.map((chunk) => ({
      sessionId,
      chunkId: chunk.id,
      text: chunk.text,
      embedding: chunk.vector ?? [],
      metadata: chunk.metadata,
      createdAt: new Date()
    }));

    if (docs.length > 0) {
      const endInsert = logger.time("vectorStore", "insertMany chunks");
      await this.options.collection.insertMany(docs);
      endInsert();
    }

    logger.info("vectorStore", "Chunks stored", { sessionId, chunkCount: docs.length });
  }

  async vectorSearch(
    sessionId: string,
    vector: number[],
    topK: number
  ): Promise<ScoredChunk[]> {
    try {
      logger.info("vectorStore", "Running $vectorSearch", {
        sessionId,
        topK,
        vectorDimensions: vector.length
      });

      const endSearch = logger.time("vectorStore", "$vectorSearch aggregation");
      const pipeline: Document[] = [
        {
          $vectorSearch: {
            index: this.options.indexName,
            path: "embedding",
            queryVector: vector,
            numCandidates: Math.max(50, topK * 10),
            limit: topK,
            filter: { sessionId: { $eq: sessionId } }
          }
        },
        {
          $project: {
            chunkId: 1,
            text: 1,
            metadata: 1,
            score: { $meta: "vectorSearchScore" }
          }
        }
      ];

      const docs = await this.options.collection.aggregate(pipeline).toArray();
      endSearch();

      const results = docs.map((doc) => ({
        id: String(doc.chunkId),
        text: String(doc.text),
        metadata: doc.metadata as Chunk["metadata"],
        score: Number(doc.score)
      }));

      logger.info("vectorStore", "Vector search complete", {
        sessionId,
        resultCount: results.length
      });

      return results;
    } catch (error) {
      logger.error("vectorStore", "Vector search failed", {
        sessionId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new ServiceUnavailableError(
        "Vector search index not ready. Please try again."
      );
    }
  }

  async deleteBySession(sessionId: string): Promise<void> {
    const result = await this.options.collection.deleteMany({ sessionId });
    logger.info("vectorStore", "Deleted session chunks", {
      sessionId,
      deletedCount: result.deletedCount
    });
  }
}
