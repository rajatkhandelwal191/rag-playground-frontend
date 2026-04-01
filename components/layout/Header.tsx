import PipelineStepper from "@/components/layout/PipelineStepper";

export default function Header() {
  return (
    <header className="space-y-3">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">RAG Playground</h1>
        <p className="text-muted-foreground">
          Follow the pipeline from ingestion to cleaned text.
        </p>
      </div>
      <PipelineStepper />
    </header>
  );
}

