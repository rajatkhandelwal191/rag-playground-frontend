export type PipelineStageId =
  | "ingestion"
  | "preprocessing"
  | "chunking"
  | "embedding"
  | "indexing"
  | "retrieval"
  | "reranking"
  | "generation"
  | "evaluation"
  | "experiment";

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
  documentId: string;  // Backend document ID
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

export interface RetrievalResult {
  chunkId: string;
  content: string;
  score: number;
  documentName: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface RerankingResult extends RetrievalResult {
  initialRank: number;
  rerankedRank: number;
  initialScore: number;
  rerankedScore: number;
}

export type LLMProvider = "openai" | "anthropic" | "google" | "local";

export type LLMModelId =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "claude-3-sonnet"
  | "claude-3-haiku"
  | "gemini-1.5-flash"
  | "gemini-1.5-pro"
  | "llama-3.1-8b";

export type PromptTemplateId =
  | "basic-qa"
  | "strict-grounded"
  | "cited-answer"
  | "summarization"
  | "context-window";

export interface PromptTemplate {
  id: PromptTemplateId;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
}

export interface GenerationResult {
  response: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  chunksUsed: number;
}

export interface EvaluationMetrics {
  latency: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  confidence: number;
  faithfulness: number;
  relevance: number;
  contextUtilization: number;
  responseQuality: number;
}


