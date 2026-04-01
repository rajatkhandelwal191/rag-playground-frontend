"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProcessingLogs from "@/components/preprocessing/ProcessingLogs";
import { Textarea } from "@/components/ui/textarea";
import { usePlaygroundStore } from "@/store/playgroundStore";
import type { EmbeddingModelId, EmbeddingProvider } from "@/types/pipeline";
import { defaultModelForProvider, modelDimension } from "@/lib/embedding";

function providerModels(p: EmbeddingProvider): EmbeddingModelId[] {
  switch (p) {
    case "google":
      return ["google-text-embedding-001"];
    case "openai":
      return ["openai-text-embedding-3-small", "openai-text-embedding-3-large"];
    case "cohere":
      return ["cohere-embed-english-v3.0"];
    case "local":
      return ["local-minilm"];
  }
}

export default function EmbeddingStage() {
  const chunks = usePlaygroundStore((s) => s.chunks);
  const embeddings = usePlaygroundStore((s) => s.embeddings);
  const points = usePlaygroundStore((s) => s.embeddingPoints2D);
  const logs = usePlaygroundStore((s) => s.embeddingLogs);
  const opts = usePlaygroundStore((s) => s.embeddingOptions);
  const setOpts = usePlaygroundStore((s) => s.setEmbeddingOptions);
  const generate = usePlaygroundStore((s) => s.generateEmbeddings);
  const documentId = usePlaygroundStore((s) => s.file?.documentName ?? "—");

  const dim = modelDimension(opts.model);
  const [selectedChunkId, setSelectedChunkId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!embeddings.length) {
      setSelectedChunkId(null);
      return;
    }
    setSelectedChunkId((prev) => prev ?? embeddings[0]!.chunkId);
  }, [embeddings]);

  const selected = selectedChunkId
    ? embeddings.find((e) => e.chunkId === selectedChunkId)
    : embeddings[0];

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3 space-y-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center justify-between gap-2">
              <span>Embedding controls</span>
              <Badge variant="secondary">Stage 4</Badge>
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Generate high-dimensional vectors for each chunk.
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Embedding provider</div>
              <select
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                value={opts.provider}
                onChange={(e) => {
                  const provider = e.target.value as EmbeddingProvider;
                  setOpts({
                    provider,
                    model: defaultModelForProvider(provider),
                  });
                }}
              >
                <option value="google">Google</option>
                <option value="openai">OpenAI</option>
                <option value="cohere">Cohere</option>
                <option value="local">Local</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Embedding model</div>
              <select
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                value={opts.model}
                onChange={(e) => setOpts({ model: e.target.value as EmbeddingModelId })}
              >
                {providerModels(opts.provider).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <div className="text-xs text-muted-foreground">
                Example: Google text-embedding-001
              </div>
            </div>

            <Card className="bg-muted/20">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Vector spec</span>
                  <Badge variant="outline">{dim} dims</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Document id</span>
                  <span className="text-xs font-medium truncate">{documentId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Chunks</span>
                  <span className="text-xs font-medium">{chunks.length}</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <div className="text-sm font-medium">Batch size</div>
              <input
                type="number"
                min={1}
                max={256}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                value={opts.batchSize}
                onChange={(e) => setOpts({ batchSize: Number(e.target.value) })}
              />
            </div>

            <Button className="w-full" onClick={generate} disabled={!chunks.length}>
              Generate embeddings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vector cards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[520px] overflow-auto">
            {embeddings.length ? (
              embeddings.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  className="w-full text-left rounded-md border bg-background p-2 hover:bg-muted/40 transition-colors"
                  onClick={() => setSelectedChunkId(e.chunkId)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{e.chunkId}</span>
                    <Badge variant="outline">{e.dimension}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {e.chunkId} → [{e.values.slice(0, 6).join(", ")}, ...]
                  </div>
                </button>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                No embeddings yet. Generate embeddings to view vectors.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="col-span-6 space-y-4">
        <Card className="h-full">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center justify-between gap-2">
              <span>2D vector map</span>
              <Badge variant="secondary">
                {points.length ? "semantic cluster visualization" : "—"}
              </Badge>
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Dots are a deterministic 2D projection of embeddings for tutorial visuals.
            </div>
          </CardHeader>
          <CardContent className="h-[520px]">
            <VectorMap
              points={points}
              selectedChunkId={selectedChunkId}
              onSelect={setSelectedChunkId}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Selected vector</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={
                selected
                  ? `${selected.chunkId} → [${selected.values
                      .slice(0, 24)
                      .join(", ")}, ...]\n\nVector size: ${selected.dimension}\nLatency: ${selected.latencyMs}ms\nDocument id: ${selected.documentId}`
                  : "Select a vector card or dot to inspect its values."
              }
              className="h-[220px] resize-none font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>

      <div className="col-span-3">
        <ProcessingLogs title="Logs" entries={logs} />
      </div>
    </div>
  );
}

function VectorMap({
  points,
  selectedChunkId,
  onSelect,
}: {
  points: Array<{ id: string; chunkId: string; x: number; y: number }>;
  selectedChunkId: string | null;
  onSelect: (chunkId: string) => void;
}) {
  if (!points.length) {
    return (
      <div className="h-full rounded-lg border bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">
        Generate embeddings to see the 2D vector map.
      </div>
    );
  }

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const norm = (v: number, min: number, max: number) =>
    max === min ? 0.5 : (v - min) / (max - min);

  return (
    <div className="relative h-full w-full rounded-lg border bg-linear-to-br from-muted/20 to-muted/50 overflow-hidden">
      <div className="absolute inset-0">
        {points.map((p) => {
          const left = `${norm(p.x, minX, maxX) * 100}%`;
          const top = `${(1 - norm(p.y, minY, maxY)) * 100}%`;
          const active = selectedChunkId === p.chunkId;
          return (
            <button
              key={p.id}
              type="button"
              title={p.chunkId}
              onClick={() => onSelect(p.chunkId)}
              className={[
                "absolute -translate-x-1/2 -translate-y-1/2 rounded-full",
                active ? "bg-primary" : "bg-foreground/70",
              ].join(" ")}
              style={{
                left,
                top,
                width: active ? 10 : 7,
                height: active ? 10 : 7,
                boxShadow: active ? "0 0 0 6px rgba(59,130,246,0.15)" : undefined,
              }}
            />
          );
        })}
      </div>
      <div className="absolute left-3 top-3 flex gap-2">
        <Badge variant="outline">x</Badge>
        <Badge variant="outline">y</Badge>
      </div>
    </div>
  );
}

