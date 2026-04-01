"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePlaygroundStore } from "@/store/playgroundStore";
import type { PipelineStageId } from "@/types/pipeline";

const STAGES: Array<{
  id: PipelineStageId;
  label: string;
  helper: string;
}> = [
  {
    id: "ingestion",
    label: "1) Ingestion",
    helper: "How data enters the system",
  },
  {
    id: "preprocessing",
    label: "2) Preprocessing & Cleaning",
    helper: "Normalize and prepare extracted text",
  },
  {
    id: "chunking",
    label: "3) Chunking",
    helper: "Split text into retrievable chunks",
  },
  {
    id: "embedding",
    label: "4) Embedding",
    helper: "Convert chunks into vectors",
  },
  {
    id: "indexing",
    label: "5) Vector store / Indexing",
    helper: "Persist vectors and payload mapping",
  },
  {
    id: "retrieval",
    label: "6) Retrieval",
    helper: "Search and retrieve relevant chunks",
  },
  {
    id: "reranking",
    label: "7) Re-ranking",
    helper: "Reorder retrieved chunks for final context",
  },
  {
    id: "generation",
    label: "8) Generation",
    helper: "LLM prompt and response generation",
  },
  {
    id: "evaluation",
    label: "9) Evaluation",
    helper: "RAG metrics and observability",
  },
];

export default function PipelineStepper() {
  const stage = usePlaygroundStore((s) => s.stage);
  const setStage = usePlaygroundStore((s) => s.setStage);
  const hasFile = usePlaygroundStore((s) => Boolean(s.file));
  const hasText = usePlaygroundStore((s) => Boolean((s.cleanedText || s.rawText).trim()));
  const hasChunks = usePlaygroundStore((s) => s.chunks.length > 0);
  const hasEmbeddings = usePlaygroundStore((s) => s.embeddings.length > 0);
  const hasIndex = usePlaygroundStore((s) => Boolean(s.indexStats));
  const hasRetrievalResults = usePlaygroundStore((s) => s.retrievalResults.length > 0);
  const hasRerankedResults = usePlaygroundStore((s) => s.rerankedResults.length > 0);
  const hasRetrievedChunks = hasRetrievalResults || hasRerankedResults;
  const hasGenerationResult = usePlaygroundStore((s) => Boolean(s.generationResult));

  return (
    <div className="flex items-stretch gap-3">
      {STAGES.map((s, idx) => {
        const isActive = stage === s.id;
        
        // Locking logic: each stage requires the previous output to be ready
        const isPreprocessingLocked = s.id === "preprocessing" && !hasFile;
        const isChunkingLocked = s.id === "chunking" && (!hasFile || !hasText);
        const isEmbeddingLocked = s.id === "embedding" && (!hasFile || !hasText || !hasChunks);
        const isIndexingLocked = s.id === "indexing" && (!hasFile || !hasText || !hasChunks || !hasEmbeddings);
        const isRetrievalLocked = s.id === "retrieval" && (!hasFile || !hasText || !hasChunks || !hasEmbeddings || !hasIndex);
        const isRerankingLocked =
          s.id === "reranking" &&
          (!hasFile || !hasText || !hasChunks || !hasEmbeddings || !hasIndex || !hasRetrievalResults);
        const isGenerationLocked =
          s.id === "generation" &&
          (!hasFile || !hasText || !hasChunks || !hasEmbeddings || !hasIndex || !hasRetrievedChunks);
        const isEvaluationLocked =
          s.id === "evaluation" &&
          (!hasFile || !hasText || !hasChunks || !hasEmbeddings || !hasIndex || !hasRetrievedChunks || !hasGenerationResult);

        const locked =
          isPreprocessingLocked ||
          isChunkingLocked ||
          isEmbeddingLocked ||
          isIndexingLocked ||
          isRetrievalLocked ||
          isRerankingLocked ||
          isGenerationLocked ||
          isEvaluationLocked;

        const lockLabel =
          s.id === "evaluation" && !hasGenerationResult
            ? "Needs generation"
            : s.id === "generation" && !hasRetrievedChunks
              ? "Needs retrieval"
              : s.id === "reranking" && !hasRetrievalResults
                ? "Needs results"
                : s.id === "retrieval" && !hasIndex
                  ? "Needs index"
                  : s.id === "indexing" && !hasEmbeddings
                    ? "Needs vectors"
                    : s.id === "embedding" && !hasChunks
                      ? "Needs chunks"
                      : s.id === "chunking" && !hasText
                        ? "Needs text"
                        : "Needs file";
        return (
          <div key={s.id} className="flex-1">
            <Button
              type="button"
              className={cn(
                "w-full justify-between h-auto py-3",
                isActive ? "" : "bg-muted/40 hover:bg-muted"
              )}
              variant={isActive ? "default" : "outline"}
              onClick={() => setStage(s.id)}
              disabled={locked}
            >
              <div className="flex flex-col items-start gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{s.label}</span>
                  {locked ? <Badge variant="secondary">{lockLabel}</Badge> : null}
                </div>
                <span className="text-xs text-muted-foreground">{s.helper}</span>
              </div>
              <Badge variant={isActive ? "secondary" : "outline"}>
                {idx + 1}/{STAGES.length}
              </Badge>
            </Button>
          </div>
        );
      })}
    </div>
  );
}

