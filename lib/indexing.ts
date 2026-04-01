import type { DistanceMetric } from "@/types/pipeline";

export type IndexStats = {
  collectionName: string;
  vectorCount: number;
  totalChunks: number;
  documentCount: number;
  indexingLatencyMs: number;
  distanceMetric: DistanceMetric;
};

export function simulateIndexingLatency(args: {
  vectorCount: number;
  batchSize: number;
}): number {
  const base = 60;
  const perVector = Math.min(2.2, 0.4 + args.vectorCount / 5000);
  const batchPenalty = Math.max(0, 18 - Math.min(18, args.batchSize));
  return Math.round(base + args.vectorCount * perVector + batchPenalty);
}

