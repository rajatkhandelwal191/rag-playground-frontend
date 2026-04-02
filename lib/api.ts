/**
 * Backend API Client for RAG Pipeline
 * Base URL: http://localhost:8080/api/v1
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Helper for fetch requests
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// Upload API
export async function uploadFile(file: File): Promise<{
  document_id: string;
  document_name: string;
  source_type: string;
  file_size: number;
  content_type: string;
  raw_text: string;
  metadata: {
    filename: string;
    size: number;
    extension: string;
    page_count?: number;
  };
  created_at: string;
}> {
  const formData = new FormData();
  formData.append("file", file);

  return fetchApi("/upload/", {
    method: "POST",
    body: formData,
  });
}

export async function getDocument(documentId: string) {
  return fetchApi(`/upload/${documentId}`);
}

export async function getDocumentText(documentId: string, cleaned = false) {
  return fetchApi(`/upload/${documentId}/text?cleaned=${cleaned}`);
}

// Preprocessing API
export async function preprocessDocument(
  documentId: string,
  options: {
    lowercase?: boolean;
    remove_extra_whitespace?: boolean;
    normalize_unicode?: boolean;
    remove_urls?: boolean;
    remove_emails?: boolean;
    remove_phone_numbers?: boolean;
    ocr_cleanup?: boolean;
    preserve_punctuation?: boolean;
  } = {}
): Promise<{
  document_id: string;
  raw_text_preview: string;
  cleaned_text_preview: string;
  stats_before: { char_count: number; word_count: number; line_count: number };
  stats_after: { char_count: number; word_count: number; line_count: number };
  processing_applied: Record<string, boolean>;
}> {
  const params = new URLSearchParams();
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString());
    }
  });

  return fetchApi(`/preprocessing/${documentId}?${params.toString()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}

export async function previewPreprocessing(
  text: string,
  options: {
    lowercase?: boolean;
    remove_extra_whitespace?: boolean;
    normalize_unicode?: boolean;
    remove_urls?: boolean;
    remove_emails?: boolean;
    remove_phone_numbers?: boolean;
    ocr_cleanup?: boolean;
    preserve_punctuation?: boolean;
  } = {}
) {
  const params = new URLSearchParams();
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString());
    }
  });

  return fetchApi(`/preprocessing/preview?${params.toString()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
}

// Chunking API
export type Chunk = {
  id: string;
  document_id: string;
  content: string;
  start_pos: number;
  end_pos: number;
  token_count: number;
  metadata: {
    strategy: string;
  };
};

export async function createChunks(
  documentId: string,
  options: {
    strategy?: "fixed" | "semantic" | "recursive";
    chunk_size?: number;
    chunk_overlap?: number;
  } = {}
): Promise<{
  document_id: string;
  chunks: Chunk[];
  total_chunks: number;
  strategy: string;
}> {
  return fetchApi("/chunking/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      document_id: documentId,
      strategy: options.strategy || "fixed",
      chunk_size: options.chunk_size || 1000,
      chunk_overlap: options.chunk_overlap || 200,
    }),
  });
}

// Embedding API
export type Embedding = {
  chunk_id: string;
  vector_id: string;
  values: number[];
  dimension: number;
  model: string;
  document_id: string;
};

export async function generateEmbeddings(
  chunkIds: string[],
  options: {
    provider?: "google" | "openai" | "cohere" | "local";
    model?: string;
    batch_size?: number;
  } = {}
): Promise<{
  embeddings: Embedding[];
  model: string;
  dimension: number;
  total_embedded: number;
}> {
  return fetchApi("/embedding/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chunk_ids: chunkIds,
      provider: options.provider || "google",
      model: options.model,
      batch_size: options.batch_size || 32,
    }),
  });
}

export async function indexEmbeddings(
  options: {
    collection_name?: string;
    distance_metric?: "cosine" | "euclidean" | "dot_product";
  } = {}
): Promise<{
  message: string;
  indexed_count: number;
  collection: string;
}> {
  return fetchApi("/embedding/index", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      collection_name: options.collection_name || "rag_documents",
      distance_metric: options.distance_metric || "cosine",
    }),
  });
}

export async function getIndexStats(collectionName = "rag_documents") {
  return fetchApi(`/embedding/index/stats?collection_name=${collectionName}`);
}

// Retrieval API
export type RetrievedChunk = {
  chunk: Chunk;
  score: number;
  embedding_id: string;
};

export async function retrieveChunks(
  query: string,
  options: {
    top_k?: number;
    collection_name?: string;
    filters?: Record<string, unknown> | null;
  } = {}
): Promise<{
  query: string;
  results: RetrievedChunk[];
  total_found: number;
  latency_ms: number;
}> {
  return fetchApi("/retrieval/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      top_k: options.top_k || 5,
      collection_name: options.collection_name || "rag_documents",
      filters: options.filters || null,
    }),
  });
}

export async function rerankResults(
  query: string,
  chunks: string[],
  topK = 5
): Promise<{
  query: string;
  reranked_results: {
    original_rank: number;
    content: string;
    reranked_score: number;
  }[];
  model: string;
}> {
  return fetchApi("/retrieval/rerank", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      chunks,
      top_k: topK,
    }),
  });
}

// Generation API
export type LLMProvider = "openai" | "google" | "anthropic" | "cohere" | "groq";

export async function generateResponse(
  query: string,
  contextChunks: string[],
  options: {
    provider?: LLMProvider;
    model?: string;
    temperature?: number;
    max_tokens?: number;
    system_prompt?: string;
  } = {}
): Promise<{
  response: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  model: string;
  chunks_used: number;
}> {
  return fetchApi("/generation/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      context_chunks: contextChunks,
      provider: options.provider || "openai",
      model: options.model,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens || 1024,
      system_prompt: options.system_prompt,
    }),
  });
}

export async function getAvailableModels(): Promise<{
  providers: {
    id: string;
    name: string;
    models: { id: string; name: string }[];
  }[];
}> {
  return fetchApi("/generation/models");
}

// Experiment API
export async function getPipelineSummary(documentId: string) {
  return fetchApi(`/experiment/summary/${documentId}`);
}

export async function compareDocuments(documentIds: string[]) {
  return fetchApi(`/experiment/compare?document_ids=${documentIds.join(",")}`);
}

export async function getSystemStats() {
  return fetchApi("/experiment/stats");
}

export async function getExperimentModels() {
  return fetchApi("/experiment/models");
}

export async function resetPipeline(
  documentId: string,
  stage?: "chunking" | "embedding" | "indexing" | "preprocessing" | "all"
) {
  return fetchApi(`/experiment/reset/${documentId}${stage ? `?stage=${stage}` : ""}`, {
    method: "POST",
  });
}

// Health check
export async function checkHealth(): Promise<{ status: string }> {
  return fetchApi("/health");
}
