"use client";

import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProcessingLogs from "@/components/preprocessing/ProcessingLogs";
import { usePlaygroundStore } from "@/store/playgroundStore";
import type { DistanceMetric } from "@/types/pipeline";
import { indexEmbeddings, getIndexStats } from "@/lib/api";

export default function IndexingStage() {
  const opts = usePlaygroundStore((s) => s.indexingOptions);
  const setOpts = usePlaygroundStore((s) => s.setIndexingOptions);
  const stats = usePlaygroundStore((s) => s.indexStats);
  const setIndexStats = usePlaygroundStore((s) => s.setIndexStats);
  const logs = usePlaygroundStore((s) => s.indexingLogs);
  const indexVectors = usePlaygroundStore((s) => s.indexVectors);
  const useBackend = usePlaygroundStore((s) => s.useBackend);
  const addLog = usePlaygroundStore((s) => s.addLog);
  const setStage = usePlaygroundStore((s) => s.setStage);
  const chunks = usePlaygroundStore((s) => s.chunks);
  const embeddings = usePlaygroundStore((s) => s.embeddings);
  const docId = usePlaygroundStore((s) => s.file?.documentName ?? "—");

  const mappings = chunks.map((c) => {
    const vec = embeddings.find((e) => e.chunkId === c.chunkId);
    return {
      chunkId: c.chunkId,
      vectorId: vec?.id ?? "—",
      documentId: vec?.documentId ?? docId,
    };
  });

  const handleIndexVectors = useCallback(async () => {
    if (useBackend) {
      addLog("indexing", "Indexing vectors via backend...");
      try {
        const result = await indexEmbeddings({
          collection_name: opts.collectionName,
          distance_metric: opts.distanceMetric as "cosine" | "euclidean" | "dot_product",
        });

        // Fetch updated stats (can be used for debugging)
        await getIndexStats(opts.collectionName);

        // Update store with backend results
        setIndexStats({
          collectionName: opts.collectionName,
          vectorCount: result.indexed_count,
          totalChunks: chunks.length,
          documentCount: docId === "—" ? 0 : 1,
          indexingLatencyMs: 0, // Backend doesn't return this
          distanceMetric: opts.distanceMetric,
        });

        addLog("indexing", `Collection name: ${opts.collectionName}`);
        addLog("indexing", `Distance metric: ${opts.distanceMetric}`);
        addLog("indexing", `Indexed ${result.indexed_count} vectors`);
        addLog("indexing", "Indexing complete");
        setStage("retrieval");
      } catch (error) {
        addLog("indexing", `Indexing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    } else {
      // Use local indexing via store
      indexVectors();
    }
  }, [useBackend, opts, chunks.length, docId, addLog, setIndexStats, setStage, indexVectors]);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3 space-y-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center justify-between gap-2">
              <span>Vector store / indexing</span>
              <Badge variant="secondary">Stage 5</Badge>
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Qdrant-style collection stats + mapping visibility.
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Collection name</div>
              <input
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                value={opts.collectionName}
                onChange={(e) => setOpts({ collectionName: e.target.value })}
                placeholder="rag_playground_chunks"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Distance metric</div>
              <select
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                value={opts.distanceMetric}
                onChange={(e) =>
                  setOpts({ distanceMetric: e.target.value as DistanceMetric })
                }
              >
                <option value="cosine">Cosine similarity</option>
                <option value="dot">Dot product</option>
                <option value="euclidean">Euclidean</option>
              </select>
              <div className="text-xs text-muted-foreground">
                Example: Cosine similarity
              </div>
            </div>

            <Button className="w-full" onClick={handleIndexVectors} disabled={!embeddings.length}>
              Index vectors (upsert)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collection stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatRow label="collection name" value={stats?.collectionName ?? "—"} />
            <StatRow label="vector count" value={stats ? String(stats.vectorCount) : "—"} />
            <StatRow label="total chunks" value={stats ? String(stats.totalChunks) : String(chunks.length)} />
            <StatRow label="document count" value={stats ? String(stats.documentCount) : (docId === "—" ? "0" : "1")} />
            <StatRow
              label="indexing latency"
              value={stats ? `${stats.indexingLatencyMs}ms` : "—"}
            />
            <StatRow
              label="distance metric"
              value={stats?.distanceMetric ?? opts.distanceMetric}
            />
          </CardContent>
        </Card>
      </div>

      <div className="col-span-6 space-y-4">
        <Card className="h-full">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center justify-between gap-2">
              <span>Relationship view</span>
              <Badge variant="secondary">chunk_id → vector_id → document_id</Badge>
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              This mapping is what you persist in Qdrant payloads/IDs.
            </div>
          </CardHeader>
          <CardContent className="h-[520px] overflow-auto rounded-lg border bg-muted/10 p-3">
            {mappings.length ? (
              <div className="space-y-2">
                {mappings.map((m) => (
                  <div
                    key={m.chunkId}
                    className="rounded-lg border bg-background p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant="outline">{m.chunkId}</Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge variant="secondary" className="max-w-full truncate">
                        {m.vectorId}
                      </Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge variant="outline" className="max-w-full truncate">
                        {m.documentId}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No chunks yet. Generate chunks and embeddings first.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="col-span-3">
        <ProcessingLogs title="Logs" entries={logs} />
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-right">{value}</div>
    </div>
  );
}

