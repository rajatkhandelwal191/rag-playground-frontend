"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RetrievalResult, RerankingResult } from "@/types/pipeline";
import { FileText, AlertCircle } from "lucide-react";

interface RetrievedChunksDisplayProps {
  chunks: (RetrievalResult | RerankingResult)[];
}

function isRerankingResult(
  chunk: RetrievalResult | RerankingResult
): chunk is RerankingResult {
  return "initialRank" in chunk;
}

export default function RetrievedChunksDisplay({
  chunks,
}: RetrievedChunksDisplayProps) {
  const hasChunks = chunks.length > 0;
  const isReranked = hasChunks && isRerankingResult(chunks[0]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Retrieved Context
          {hasChunks && (
            <Badge variant="secondary">
              {chunks.length} chunk{chunks.length > 1 ? "s" : ""}
            </Badge>
          )}
          {isReranked && <Badge variant="outline">Reranked</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasChunks ? (
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">No chunks retrieved</p>
              <p className="text-xs text-muted-foreground">
                Go to the retrieval stage to search for relevant content
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {chunks.slice(0, 5).map((chunk, index) => {
              const rerankInfo = isRerankingResult(chunk)
                ? {
                    initialRank: chunk.initialRank,
                    rerankedRank: chunk.rerankedRank,
                    initialScore: chunk.initialScore,
                    rerankedScore: chunk.rerankedScore,
                  }
                : null;

              return (
                <div
                  key={chunk.chunkId}
                  className="p-3 bg-muted rounded-lg border-l-4 border-l-primary"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {chunk.chunkId}
                      </Badge>
                      {rerankInfo ? (
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-muted-foreground">
                            Rank: {rerankInfo.initialRank} →{" "}
                            {rerankInfo.rerankedRank}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            title={`Initial: ${rerankInfo.initialScore.toFixed(
                              3
                            )}, Reranked: ${rerankInfo.rerankedScore.toFixed(
                              3
                            )}`}
                          >
                            Score: {rerankInfo.rerankedScore.toFixed(3)}
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Score: {chunk.score.toFixed(3)}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      #{index + 1}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-4">{chunk.content}</p>
                </div>
              );
            })}
            {chunks.length > 5 && (
              <div className="text-center text-xs text-muted-foreground py-2">
                +{chunks.length - 5} more chunk{chunks.length > 6 ? "s" : ""} (showing top 5)
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
