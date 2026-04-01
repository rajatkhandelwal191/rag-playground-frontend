"use client";

import { ArrowRight, MoveUpRight, MoveDownRight, Minus } from "lucide-react";
import { usePlaygroundStore } from "@/store/playgroundStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function RerankingComparison() {
  const results = usePlaygroundStore((s) => s.rerankedResults);
  const logs = usePlaygroundStore((s) => s.rerankingLogs);

  const rankDelta = (before: number, after: number) => before - after;

  return (
    <Card className="h-full">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center justify-between">
          <span>Before / after ranking</span>
          <Badge variant="secondary">{results.length ? "Updated" : "Waiting"}</Badge>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Example: Before rank 4 → After rank 1
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-12 gap-4 h-[520px]">
        <div className="col-span-8 h-full overflow-auto rounded-lg border bg-muted/10 p-3 space-y-3">
          {results.length ? (
            results.map((item) => {
              const delta = rankDelta(item.initialRank, item.rerankedRank);
              return (
                <div key={item.chunkId} className="rounded-lg border bg-background p-3 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.chunkId}</Badge>
                      <span className="text-xs text-muted-foreground">{item.documentName}</span>
                    </div>
                    <div className="text-xs font-mono">
                      {item.initialRank} <ArrowRight className="inline size-3" />{" "}
                      {item.rerankedRank}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Before: rank {item.initialRank}
                    </span>
                    <span className="text-muted-foreground">
                      After: rank {item.rerankedRank}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">Initial {item.initialScore.toFixed(3)}</span>
                    <span className="font-medium">Reranked {item.rerankedScore.toFixed(3)}</span>
                  </div>
                  <Progress value={item.rerankedScore * 100} className="h-1.5" />
                  <div className="text-xs">
                    {delta > 0 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <MoveUpRight className="size-3" />
                        Up {delta}
                      </span>
                    ) : delta < 0 ? (
                      <span className="inline-flex items-center gap-1 text-rose-600">
                        <MoveDownRight className="size-3" />
                        Down {Math.abs(delta)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Minus className="size-3" />
                        No change
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-muted-foreground">
              Run re-ranking to compare how results move from retrieved top 10 to reranked top 3.
            </div>
          )}
        </div>
        <div className="col-span-4 h-full overflow-auto rounded-lg border bg-black/90 p-3 font-mono text-[11px] text-green-400/90 space-y-1">
          {logs.length ? (
            logs.map((log) => (
              <div key={log.id}>
                <span className="opacity-40">[{new Date(log.tsISO).toLocaleTimeString()}]</span>{" "}
                {log.message}
              </div>
            ))
          ) : (
            <div className="opacity-40">No reranking logs yet.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
