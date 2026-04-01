"use client";

import CleaningControls from "@/components/preprocessing/CleaningControls";
import TextComparisonPanel from "@/components/preprocessing/TextComparisonPanel";
import ProcessingLogs from "@/components/preprocessing/ProcessingLogs";
import FileDetailsCard from "@/components/ingestion/FileDetailsCard";
import { usePlaygroundStore } from "@/store/playgroundStore";

export default function PreprocessingStage() {
  const file = usePlaygroundStore((s) => s.file);
  const preprocessingLogs = usePlaygroundStore((s) => s.preprocessingLogs);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3 space-y-4">
        <FileDetailsCard file={file} />
        <CleaningControls />
      </div>

      <div className="col-span-6">
        <TextComparisonPanel />
      </div>

      <div className="col-span-3">
        <ProcessingLogs title="Side log panel" entries={preprocessingLogs} />
      </div>
    </div>
  );
}

