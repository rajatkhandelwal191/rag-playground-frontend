"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DocumentMetadata } from "@/types/pipeline";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-right">{value}</div>
    </div>
  );
}

export default function FileDetailsCard({
  file,
}: {
  file: DocumentMetadata | null;
}) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center justify-between gap-2">
          <span>File details</span>
          {file?.fileType ? <Badge variant="secondary">{file.fileType}</Badge> : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Row label="Document Name" value={file?.documentName ?? "—"} />
        <Row label="Source" value={file?.source ?? "—"} />
        <Row label="Pages" value={file?.pages ? String(file.pages) : "—"} />
        <Row label="Characters" value={file ? String(file.characters) : "—"} />
        <Row
          label="Tokens (estimated)"
          value={file ? String(file.tokensEstimated) : "—"}
        />
      </CardContent>
    </Card>
  );
}

