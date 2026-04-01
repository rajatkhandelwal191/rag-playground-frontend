"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { usePlaygroundStore } from "@/store/playgroundStore";

export default function TextComparisonPanel() {
  const rawText = usePlaygroundStore((s) => s.rawText);
  const cleanedText = usePlaygroundStore((s) => s.cleanedText);
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Raw vs Cleaned Text</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 h-[500px]">
        <Textarea
          className="h-full resize-none font-mono text-sm"
          readOnly
          value={rawText || "Raw extracted text will appear here."}
        />
        <Textarea
          className="h-full resize-none font-mono text-sm"
          readOnly
          value={cleanedText || "Cleaned text will appear here."}
        />
      </CardContent>
    </Card>
  );
}