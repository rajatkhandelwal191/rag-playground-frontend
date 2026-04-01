import type { RetrievalResult, LogEntry } from "@/types/pipeline";
import type { Chunk } from "./chunking";

export interface RetrievalOptions {
  query: string;
  topK: number;
  scoreThreshold: number;
  metadataFilter: string;
}

export function simulateRetrieval({
  query,
  chunks,
  options,
  documentName,
}: {
  query: string;
  chunks: Chunk[];
  options: RetrievalOptions;
  documentName: string;
}): { results: RetrievalResult[]; logs: LogEntry[]; latencyMs: number } {
  const logs: LogEntry[] = [];
  const addLog = (message: string) => {
    logs.push({
      id: crypto.randomUUID(),
      tsISO: new Date().toISOString(),
      message,
    });
  };

  addLog("Generating query embedding");
  addLog("Searching Qdrant");
  addLog("Computing cosine similarity");

  // Filter chunks based on some simple logic (mocking semantic search)
  // We'll just take a random subset and assign scores if query is present
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  
  const scoredResults: RetrievalResult[] = chunks.map((chunk) => {
    let score = 0.5 + Math.random() * 0.3; // Base random score
    
    // Boost score if query terms are found in chunk content
    if (queryTerms.length > 0) {
      const contentLower = chunk.text.toLowerCase();
      const matchCount = queryTerms.filter(term => contentLower.includes(term)).length;
      score += (matchCount / queryTerms.length) * 0.2;
    }

    return {
      chunkId: chunk.chunkId,
      content: chunk.text,
      score: Math.min(0.99, score),
      documentName,
    };
  });

  const sorted = [...scoredResults].sort((a, b) => b.score - a.score);
  const filtered = sorted.filter((r) => r.score >= options.scoreThreshold);
  const topK = Math.max(1, options.topK);
  const topResults =
    filtered.length > 0 ? filtered.slice(0, topK) : sorted.slice(0, topK);

  if (!filtered.length && sorted.length) {
    addLog(
      `No results above threshold ${options.scoreThreshold.toFixed(2)}, returning top ${topResults.length} fallback results`
    );
  }

  const latencyMs = Math.floor(Math.random() * 50) + 50; // 50-100ms
  
  addLog(`Top ${topResults.length} results found`);
  addLog(`Completed in ${latencyMs}ms`);

  return {
    results: topResults,
    logs,
    latencyMs,
  };
}
