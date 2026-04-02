"use client";

import { useCallback } from "react";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";``
import ProcessingLogs from "@/components/preprocessing/ProcessingLogs";
import { Textarea } from "@/components/ui/textarea";
import { usePlaygroundStore } from "@/store/playgroundStore";
import type { ChunkStrategy } from "@/types/pipeline";
import { createChunks } from "@/lib/api";

const STRATEGIES: Array<{ id: ChunkStrategy; label: string; hint: string }> = [
  { id: "character", label: "Character", hint: "Split by characters" },
  { id: "token", label: "Token", hint: "Approx tokens (whitespace)" },
  { id: "sentence", label: "Sentence", hint: "Split by sentences" },
  { id: "recursive", label: "Recursive", hint: "Paragraph + fallback" },
  { id: "semantic", label: "Semantic", hint: "Topic-aware (placeholder)" },
  { id: "important", label: "Important", hint: "Keep key parts (placeholder)" },
];

export default function ChunkingStage() {
  const chunkingOptions = usePlaygroundStore((s) => s.chunkingOptions);
  const setChunkingOptions = usePlaygroundStore((s) => s.setChunkingOptions);
  const chunks = usePlaygroundStore((s) => s.chunks);
  const setChunks = usePlaygroundStore((s) => s.setChunks);
  const logs = usePlaygroundStore((s) => s.chunkingLogs);
  const addLog = usePlaygroundStore((s) => s.addLog);
  const rawText = usePlaygroundStore((s) => s.rawText);
  const cleanedText = usePlaygroundStore((s) => s.cleanedText);
  const file = usePlaygroundStore((s) => s.file);
  const useBackend = usePlaygroundStore((s) => s.useBackend);
  const setStage = usePlaygroundStore((s) => s.setStage);
  const documentId = file?.documentId ?? "—";

  const baseText = (cleanedText || rawText).trim();
  const [selectedChunkId, setSelectedChunkId] = React.useState<string | null>(
    null
  );

  const handleGenerateChunks = useCallback(async () => {
    if (useBackend && file) {
      addLog("chunking", "Creating chunks via backend...");
      try {
        const result = await createChunks(file.documentId, {
          strategy: chunkingOptions.strategy as "fixed" | "semantic" | "recursive",
          chunk_size: chunkingOptions.chunkSize,
          chunk_overlap: chunkingOptions.overlap,
        });
        
        // Convert backend chunks to frontend format
        const convertedChunks = result.chunks.map((c, index) => ({
          id: c.id,
          chunkId: c.id,
          text: c.content,
          start: c.start_pos,
          end: c.end_pos,
          tokenCount: c.token_count,
          index,
        }));
        
        setChunks(convertedChunks);
        addLog("chunking", `Created ${result.total_chunks} chunks`);
        addLog("chunking", "Chunking complete");
        setStage("embedding");
      } catch (error) {
        addLog("chunking", `Chunking failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    } else {
      // Use local generation via store
      const generateChunks = usePlaygroundStore.getState().generateChunks;
      generateChunks();
    }
  }, [useBackend, file, chunkingOptions, addLog, setChunks, setStage]);

  React.useEffect(() => {
    if (!chunks.length) {
      setSelectedChunkId(null);
      return;
    }
    setSelectedChunkId((prev) => prev ?? chunks[0]!.id);
  }, [chunks]);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3 space-y-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center justify-between gap-2">
              <span>Chunking controls</span>
              <Badge variant="secondary">Stage 3</Badge>
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Tune size/overlap and choose a strategy.
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium">Chunk size</div>
                <Badge variant="outline">{chunkingOptions.chunkSize}</Badge>
              </div>
              <Slider
                min={100}
                max={2000}
                value={[chunkingOptions.chunkSize]}
                onValueChange={(v) => setChunkingOptions({ chunkSize: v[0] ?? 800 })}
              />
              <div className="text-xs text-muted-foreground">
                Meaning depends on strategy (chars/tokens/sentences).
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium">Overlap</div>
                <Badge variant="outline">{chunkingOptions.overlap}</Badge>
              </div>
              <Slider
                min={0}
                max={Math.max(0, chunkingOptions.chunkSize - 1)}
                value={[chunkingOptions.overlap]}
                onValueChange={(v) =>
                  setChunkingOptions({ overlap: v[0] ?? 120 })
                }
              />
              <div className="text-xs text-muted-foreground">
                Shared context between adjacent chunks.
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium">Chunk strategy</div>
                <Badge variant="outline">{chunkingOptions.strategy}</Badge>
              </div>
              <select
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                value={chunkingOptions.strategy}
                onChange={(e) =>
                  setChunkingOptions({ strategy: e.target.value as ChunkStrategy })
                }
              >
                {STRATEGIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <div className="text-xs text-muted-foreground">
                {STRATEGIES.find((s) => s.id === chunkingOptions.strategy)?.hint}
              </div>
            </div>

            <Button className="w-full" onClick={handleGenerateChunks} disabled={!baseText}>
              Generate chunks
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chunk stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Input chars</span>
              <span className="text-sm font-medium">
                {baseText ? baseText.length : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Chunks</span>
              <span className="text-sm font-medium">{chunks.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-6 space-y-4">
        <Card className="h-full">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center justify-between gap-2">
              <span>Output panel</span>
              <Badge variant="secondary">
                {chunks.length ? "Generated" : "Not generated"}
              </Badge>
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Generated chunks (cards) with positions and token counts.
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-12 gap-4 h-[520px]">
            <div className="col-span-5 h-full overflow-auto rounded-lg border bg-muted/20 p-2 space-y-2">
              {chunks.length ? (
                chunks.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="w-full text-left rounded-md border bg-background p-2 hover:bg-muted/40 transition-colors"
                    onClick={() => setSelectedChunkId(c.id)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{c.chunkId}</span>
                        <Badge variant="outline">{c.tokenCount} tok</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                        <div className="text-muted-foreground">start</div>
                        <div className="text-right font-medium">
                          {c.start >= 0 ? c.start : "—"}
                        </div>
                        <div className="text-muted-foreground">end</div>
                        <div className="text-right font-medium">
                          {c.end >= 0 ? c.end : "—"}
                        </div>
                        <div className="text-muted-foreground">document id</div>
                        <div className="text-right font-medium truncate">
                          {documentId}
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground line-clamp-3">
                        {c.text.slice(0, 160)}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-sm text-muted-foreground p-2">
                  No chunks yet. Generate chunks to preview them here.
                </div>
              )}
            </div>

            <ChunkDetail className="col-span-7" selectedChunkId={selectedChunkId} />
          </CardContent>
        </Card>
      </div>

      <div className="col-span-3">
        <ProcessingLogs title="Side log panel" entries={logs} />
      </div>
    </div>
  );
}

function ChunkDetail({
  className,
  selectedChunkId,
}: {
  className?: string;
  selectedChunkId: string | null;
}) {
  const chunks = usePlaygroundStore((s) => s.chunks);
  const selected = selectedChunkId
    ? chunks.find((c) => c.id === selectedChunkId)
    : chunks[0];

  return (
    <div className={className}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>
            {selected ? `Chunk ${selected.index + 1}` : "Chunk text"}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[440px]">
          <Textarea
            readOnly
            value={selected?.text ?? "Select a chunk to view its text."}
            className="h-full resize-none font-mono text-sm"
          />
        </CardContent>
      </Card>
    </div>
  );
}

