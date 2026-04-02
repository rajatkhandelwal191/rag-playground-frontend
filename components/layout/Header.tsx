import PipelineStepper from "@/components/layout/PipelineStepper";
import { usePlaygroundStore } from "@/store/playgroundStore";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Server } from "lucide-react";

export default function Header() {
  const useBackend = usePlaygroundStore((s) => s.useBackend);
  const setUseBackend = usePlaygroundStore((s) => s.setUseBackend);

  return (
    <header className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold">RAG Playground</h1>
          <p className="text-muted-foreground">
            Follow the pipeline from ingestion to cleaned text.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-2">
          <Server className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <Label htmlFor="backend-toggle" className="text-sm font-medium">
              Use Backend
            </Label>
            <Switch
              id="backend-toggle"
              checked={useBackend}
              onCheckedChange={setUseBackend}
            />
          </div>
        </div>
      </div>
      <PipelineStepper />
    </header>
  );
}

