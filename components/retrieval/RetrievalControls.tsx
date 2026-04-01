"use client";

import { Search, Info } from "lucide-react";
import { usePlaygroundStore } from "@/store/playgroundStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const SUGGESTED_QUESTIONS = [
  "What is the main topic of this document?",
  "Can you summarize the key findings?",
  "Are there any specific dates mentioned?",
  "Who are the main stakeholders?"
];

export default function RetrievalControls() {
  const { retrievalOptions, setRetrievalOptions, retrieve } = usePlaygroundStore();

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRetrievalOptions({ query: e.target.value });
  };

  const handleTopKChange = (val: number[]) => {
    setRetrievalOptions({ topK: val[0] });
  };

  const handleThresholdChange = (val: number[]) => {
    setRetrievalOptions({ scoreThreshold: val[0] });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Search className="w-5 h-5" />
          Search Query
        </CardTitle>
        <CardDescription>
          Ask questions or provide keywords to retrieve relevant chunks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="query">Query Input</Label>
          <Textarea
            id="query"
            placeholder="e.g., What are the key performance indicators?"
            className="min-h-[100px] resize-none"
            value={retrievalOptions.query}
            onChange={handleQueryChange}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Suggested Questions</Label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <Badge
                key={q}
                variant="outline"
                className="cursor-pointer hover:bg-muted transition-colors py-1.5 px-3"
                onClick={() => setRetrievalOptions({ query: q })}
              >
                {q}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                Top-K Results
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
              </Label>
              <span className="text-sm font-mono bg-muted px-1.5 rounded">
                {retrievalOptions.topK}
              </span>
            </div>
            <Slider
              value={[retrievalOptions.topK]}
              min={1}
              max={20}
              step={1}
              onValueChange={handleTopKChange}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                Min Score Threshold
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
              </Label>
              <span className="text-sm font-mono bg-muted px-1.5 rounded">
                {retrievalOptions.scoreThreshold.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[retrievalOptions.scoreThreshold]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={handleThresholdChange}
            />
          </div>
        </div>

        <Button className="w-full mt-4" size="lg" onClick={retrieve}>
          Run Retrieval
        </Button>
      </CardContent>
    </Card>
  );
}
