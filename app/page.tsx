"use client";

import Header from "@/components/layout/Header";
import IngestionStage from "@/components/ingestion/IngestionStage";
import PreprocessingStage from "@/components/preprocessing/PreprocessingStage";
import ChunkingStage from "@/components/chunking/ChunkingStage";
import EmbeddingStage from "@/components/embedding/EmbeddingStage";
import IndexingStage from "@/components/indexing/IndexingStage";
import RetrievalStage from "@/components/retrieval/RetrievalStage";
import { usePlaygroundStore } from "@/store/playgroundStore";

export default function Home() {
  const stage = usePlaygroundStore((s) => s.stage);
  return (
    <main className="min-h-screen p-6 space-y-6">
      <Header />
      {stage === "ingestion" ? (
        <IngestionStage />
      ) : stage === "preprocessing" ? (
        <PreprocessingStage />
      ) : stage === "chunking" ? (
        <ChunkingStage />
      ) : stage === "embedding" ? (
        <EmbeddingStage />
      ) : stage === "indexing" ? (
        <IndexingStage />
      ) : (
        <RetrievalStage />
      )}
    </main>
  );
}