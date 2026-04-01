"use client";

import { ArrowDownUp } from "lucide-react";
import { usePlaygroundStore } from "@/store/playgroundStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export default function RerankingControls() {
  const retrievalResults = usePlaygroundStore((s) => s.retrievalResults);
  const options = usePlaygroundStore((s) => s.rerankingOptions);
  const setOptions = usePlaygroundStore((s) => s.setRerankingOptions);
  const rerank = usePlaygroundStore((s) => s.rerank);

  const topKMax = Math.max(1, Math.min(10, retrievalResults.length || 10));

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center justify-between">
          <span>Re-ranking controls</span>
          <Badge variant="secondary">Stage 7</Badge>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Retrieved top 10 → reranked top {options.topK}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Final top-k</span>
            <span className="font-medium">{options.topK}</span>
          </div>
          <Slider
            value={[options.topK]}
            min={1}
            max={topKMax}
            step={1}
            onValueChange={(value) => setOptions({ topK: value[0] })}
          />
        </div>
        <Button className="w-full" onClick={rerank}>
          <ArrowDownUp className="size-4" />
          Run Re-ranking
        </Button>
      </CardContent>
    </Card>
  );
}
