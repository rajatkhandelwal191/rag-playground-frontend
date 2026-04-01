"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { LogEntry } from "@/types/pipeline";

export default function ProcessingLogs({
  title = "Live Logs",
  entries,
  progress,
}: {
  title?: string;
  entries: LogEntry[];
  progress?: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {typeof progress === "number" ? <Progress value={progress} /> : null}
        <div className="font-mono text-sm space-y-2 h-[480px] overflow-auto rounded-lg border bg-muted/20 p-3">
          {entries.length ? (
            entries.map((e) => (
              <p key={e.id}>
                <span className="text-muted-foreground">
                  {new Date(e.tsISO).toLocaleTimeString()}
                </span>{" "}
                {e.message}
              </p>
            ))
          ) : (
            <p className="text-muted-foreground">No logs yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}