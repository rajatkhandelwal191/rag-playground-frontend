"use client";

import { List, FileText, ExternalLink, Hash } from "lucide-react";
import { usePlaygroundStore } from "@/store/playgroundStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function RetrievalResultsPanel() {
  const { retrievalResults, retrievalLogs } = usePlaygroundStore();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <List className="w-5 h-5" />
          Retrieval Results
        </CardTitle>
        <CardDescription>
          Ranked chunks that match your search query
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col gap-4">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {retrievalResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg bg-muted/20">
              <FileText className="w-10 h-10 text-muted-foreground mb-4 opacity-30" />
              <p className="text-muted-foreground font-medium">No results yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Enter a query and click &quot;Run Retrieval&quot; to see matches
              </p>
            </div>
          ) : (
            retrievalResults.map((result, idx) => (
              <div
                key={result.chunkId}
                className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px] py-0 px-1.5 h-5 flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {result.chunkId}
                      </Badge>
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {result.documentName}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">
                        Score
                      </span>
                      <span className="text-sm font-bold font-mono text-primary">
                        {result.score.toFixed(3)}
                      </span>
                    </div>
                    <Progress value={result.score * 100} className="w-24 h-1.5" />
                  </div>
                </div>
                
                <div className="relative">
                  <p className="text-sm text-foreground/90 leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all">
                    {result.content}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-3 border-t border-muted/50">
                  <span className="text-[10px] text-muted-foreground font-medium">
                    RANK #{idx + 1}
                  </span>
                  <button className="text-[10px] text-primary hover:underline flex items-center gap-1 font-semibold uppercase tracking-wider">
                    View Chunk
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="h-40 shrink-0 flex flex-col border-t pt-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
            Retrieval Logs
          </h4>
          <div className="flex-1 overflow-y-auto bg-black/90 rounded-md p-3 font-mono text-[11px] text-green-400/90 leading-relaxed custom-scrollbar">
            {retrievalLogs.length === 0 ? (
              <span className="opacity-40 italic">Waiting for retrieval...</span>
            ) : (
              retrievalLogs.map((log) => (
                <div key={log.id} className="mb-1 last:mb-0">
                  <span className="opacity-40 text-[9px] mr-2">
                    [{new Date(log.tsISO).toLocaleTimeString()}]
                  </span>
                  <span>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
