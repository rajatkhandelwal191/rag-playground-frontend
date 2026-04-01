"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LogEntry, PipelineStageId } from "@/types/pipeline";
import { Terminal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlaygroundStore } from "@/store/playgroundStore";

interface LogViewerProps {
  logs: LogEntry[];
  stage: PipelineStageId;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toTimeString().split(" ")[0] + "." + String(d.getMilliseconds()).padStart(3, "0");
}

export function LogViewer({ logs, stage }: LogViewerProps) {
  const clearLogs = usePlaygroundStore((s) => s.clearLogs);

  const handleClear = () => {
    clearLogs(stage);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          Logs
          <Badge variant="secondary">{logs.length}</Badge>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleClear} disabled={logs.length === 0}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-50 w-full rounded-md border p-4 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No logs yet
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-2 text-sm">
                  <span className="text-muted-foreground whitespace-nowrap font-mono text-xs">
                    {formatTime(log.tsISO)}
                  </span>
                  <span className="break-all">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
