"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function FilePreview({ text }: { text: string }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>File preview</CardTitle>
      </CardHeader>
      <CardContent className="h-[520px]">
        <Textarea
          readOnly
          value={text || "Upload a file to preview extracted text."}
          className="h-full resize-none font-mono text-sm"
        />
      </CardContent>
    </Card>
  );
}

