import { MongoClient, type Collection, type Db } from "mongodb";
import type { Chunk } from "../types/domain.js";
import { logger } from "../utils/logger.js";

export interface ChunkDocument {
  sessionId: string;
  chunkId: string;
  text: string;
  embedding: number[];
  metadata: Chunk["metadata"];
  createdAt: Date;
}

export class MongoService {
  private client: MongoClient;
  private db?: Db;

  constructor(
    private readonly uri: string,
    private readonly dbName: string,
    private readonly chunksCollectionName: string
  ) {
    this.client = new MongoClient(this.uri);
  }

  async connect(): Promise<void> {
    if (!this.db) {
      logger.info("mongodb", "Connecting to MongoDB", {
        uri: this.uri,
        dbName: this.dbName,
        collection: this.chunksCollectionName
      });
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      logger.info("mongodb", "MongoDB connected");
    }
  }

  async close(): Promise<void> {
    await this.client.close();
    this.db = undefined;
    logger.info("mongodb", "MongoDB connection closed");
  }

  getChunksCollection(): Collection<ChunkDocument> {
    if (!this.db) {
      throw new Error("MongoService is not connected");
    }
    return this.db.collection<ChunkDocument>(this.chunksCollectionName);
  }
}
