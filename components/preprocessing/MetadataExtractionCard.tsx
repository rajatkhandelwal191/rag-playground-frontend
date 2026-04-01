"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlaygroundStore } from "@/store/playgroundStore";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-right">{value}</div>
    </div>
  );
}

export default function MetadataExtractionCard() {
  const rawText = usePlaygroundStore((s) => s.rawText);
  const cleanedText = usePlaygroundStore((s) => s.cleanedText);
  const file = usePlaygroundStore((s) => s.file);

  const text = cleanedText || rawText;
  const characters = text.length;
  const tokensEstimated = text ? Math.max(1, Math.round(characters / 4)) : 0;
  const lines = text ? text.split("\n").length : 0;
  const words = text ? (text.match(/\b[\p{L}\p{N}'-]+\b/gu) ?? []).length : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadata extraction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Row label="Language" value={file?.language ?? "—"} />
        <Row label="Lines" value={lines ? String(lines) : "—"} />
        <Row label="Words" value={words ? String(words) : "—"} />
        <Row label="Characters" value={characters ? String(characters) : "—"} />
        <Row
          label="Tokens (estimated)"
          value={tokensEstimated ? String(tokensEstimated) : "—"}
        />
      </CardContent>
    </Card>
  );
}

