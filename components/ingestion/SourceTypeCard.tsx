"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SourceType } from "@/types/pipeline";

export default function SourceTypeCard({
  sourceType,
  onSetSourceType,
}: {
  sourceType: SourceType;
  onSetSourceType: (t: SourceType) => void;
}) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center justify-between gap-2">
          <span>Source type</span>
          <Badge variant="secondary">{sourceType}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button
          className="flex-1"
          variant={sourceType === "upload" ? "default" : "outline"}
          onClick={() => onSetSourceType("upload")}
        >
          Upload
        </Button>
        <Button
          className="flex-1"
          variant={sourceType === "sample" ? "default" : "outline"}
          onClick={() => onSetSourceType("sample")}
        >
          Sample
        </Button>
      </CardContent>
    </Card>
  );
}

