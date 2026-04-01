export type PipelineStageId =
  | "ingestion"
  | "preprocessing"
  | "chunking"
  | "embedding"
  | "indexing";

export type SourceType = "upload" | "sample";

export type ChunkStrategy =
  | "character"
  | "token"
  | "sentence"
  | "recursive"
  | "semantic"
  | "important";

export type EmbeddingProvider = "google" | "openai" | "cohere" | "local";

export type EmbeddingModelId =
  | "google-text-embedding-001"
  | "openai-text-embedding-3-small"
  | "openai-text-embedding-3-large"
  | "cohere-embed-english-v3.0"
  | "local-minilm";

export type DistanceMetric = "cosine" | "dot" | "euclidean";

export interface DocumentMetadata {
  documentName: string;
  fileType: "PDF" | "DOCX" | "TXT";
  pages?: number;
  characters: number;
  tokensEstimated: number;
  uploadTimeISO: string;
  language: string;
  source: SourceType;
}

export interface LogEntry {
  id: string;
  tsISO: string;
  message: string;
}

