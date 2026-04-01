"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DocumentMetadata } from "@/types/pipeline";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-right">{value}</div>
    </div>
  );
}

export default function MetadataCard({ file }: { file: DocumentMetadata | null }) {
  const uploadTime = file?.uploadTimeISO
    ? new Date(file.uploadTimeISO).toLocaleString()
    : "—";
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadata</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Row label="Upload Time" value={uploadTime} />
        <Row label="Language" value={file?.language ?? "—"} />
      </CardContent>
    </Card>
  );
}

