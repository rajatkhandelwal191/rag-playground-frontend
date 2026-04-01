import type { EmbeddingModelId, EmbeddingProvider } from "@/types/pipeline";

export type EmbeddingVector = {
  id: string;
  chunkId: string;
  documentId: string;
  dimension: number;
  values: number[];
  latencyMs: number;
};

export type VectorPoint2D = {
  id: string;
  chunkId: string;
  x: number;
  y: number;
};

export function modelDimension(model: EmbeddingModelId): number {
  switch (model) {
    case "google-text-embedding-001":
      return 768;
    case "openai-text-embedding-3-small":
      return 1536;
    case "openai-text-embedding-3-large":
      return 3072;
    case "cohere-embed-english-v3.0":
      return 1024;
    case "local-minilm":
      return 384;
  }
}

export function defaultModelForProvider(p: EmbeddingProvider): EmbeddingModelId {
  switch (p) {
    case "google":
      return "google-text-embedding-001";
    case "openai":
      return "openai-text-embedding-3-small";
    case "cohere":
      return "cohere-embed-english-v3.0";
    case "local":
      return "local-minilm";
  }
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hashToSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function generateMockEmbedding(args: {
  provider: EmbeddingProvider;
  model: EmbeddingModelId;
  chunkId: string;
  documentId: string;
}): EmbeddingVector {
  const dimension = modelDimension(args.model);
  const seed = hashToSeed(
    `${args.provider}:${args.model}:${args.documentId}:${args.chunkId}`
  );
  const rand = mulberry32(seed);

  const values = Array.from({ length: dimension }, () => {
    const v = rand() * 2 - 1;
    return Math.round(v * 1000) / 1000;
  });

  const latencyMs = Math.round(60 + rand() * 140);

  return {
    id: crypto.randomUUID(),
    chunkId: args.chunkId,
    documentId: args.documentId,
    dimension,
    values,
    latencyMs,
  };
}

export function projectTo2D(vectors: EmbeddingVector[]): VectorPoint2D[] {
  // Deterministic 2D projection (not real PCA/UMAP), but good for tutorial visuals.
  // Use two pseudo-random directions per model/doc combination via hashing.
  const dirFor = (key: string, dim: number) => {
    const rand = mulberry32(hashToSeed(key));
    const d = Array.from({ length: dim }, () => rand() * 2 - 1);
    const norm = Math.sqrt(d.reduce((a, x) => a + x * x, 0)) || 1;
    return d.map((x) => x / norm);
  };

  return vectors.map((v) => {
    const dim = v.dimension;
    const d1 = dirFor(`d1:${v.documentId}:${dim}`, dim);
    const d2 = dirFor(`d2:${v.documentId}:${dim}`, dim);
    const dot = (a: number[], b: number[]) =>
      a.reduce((sum, x, i) => sum + x * (b[i] ?? 0), 0);

    const x = dot(v.values, d1);
    const y = dot(v.values, d2);

    return { id: v.id, chunkId: v.chunkId, x, y };
  });
}

