export interface Section {
  title: string;
  content: string;
}

export interface Article {
  title: string;
  url: string;
  sections: Section[];
  text: string;
}

export interface ChunkMetadata {
  sectionTitle: string;
  chunkIndex: number;
  sourceUrl: string;
}

export interface Chunk {
  id: string;
  text: string;
  metadata: ChunkMetadata;
  vector?: number[];
}

export interface ScoredChunk extends Chunk {
  score: number;
}

export interface SessionData {
  sessionId: string;
  title: string;
  summary: string;
  url: string;
  createdAt: Date;
}
