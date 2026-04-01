"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePlaygroundStore } from "@/store/playgroundStore";
import type { PipelineStageId } from "@/types/pipeline";

const STAGES: Array<{
  id: PipelineStageId;
  label: string;
  helper: string;
}> = [
  {
    id: "ingestion",
    label: "1) Ingestion",
    helper: "How data enters the system",
  },
  {
    id: "preprocessing",
    label: "2) Preprocessing & Cleaning",
    helper: "Normalize and prepare extracted text",
  },
];

export default function PipelineStepper() {
  const stage = usePlaygroundStore((s) => s.stage);
  const setStage = usePlaygroundStore((s) => s.setStage);
  const hasFile = usePlaygroundStore((s) => Boolean(s.file));

  return (
    <div className="flex items-stretch gap-3">
      {STAGES.map((s, idx) => {
        const isActive = stage === s.id;
        const isLocked = s.id === "preprocessing" && !hasFile;
        return (
          <div key={s.id} className="flex-1">
            <Button
              type="button"
              className={cn(
                "w-full justify-between h-auto py-3",
                isActive ? "" : "bg-muted/40 hover:bg-muted"
              )}
              variant={isActive ? "default" : "outline"}
              onClick={() => setStage(s.id)}
              disabled={isLocked}
            >
              <div className="flex flex-col items-start gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{s.label}</span>
                  {isLocked ? <Badge variant="secondary">Needs file</Badge> : null}
                </div>
                <span className="text-xs text-muted-foreground">{s.helper}</span>
              </div>
              <Badge variant={isActive ? "secondary" : "outline"}>
                {idx + 1}/{STAGES.length}
              </Badge>
            </Button>
          </div>
        );
      })}
    </div>
  );
}

