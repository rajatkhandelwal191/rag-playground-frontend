"use client";

import UploadDropzone from "@/components/ingestion/UploadDropzone";
import FileDetailsCard from "@/components/ingestion/FileDetailsCard";
import FilePreview from "@/components/ingestion/FilePreview";
import MetadataCard from "@/components/ingestion/MetadataCard";
import SourceTypeCard from "@/components/ingestion/SourceTypeCard";
import ProcessingLogs from "@/components/preprocessing/ProcessingLogs";
import { usePlaygroundStore } from "@/store/playgroundStore";

export default function IngestionStage() {
  const file = usePlaygroundStore((s) => s.file);
  const rawText = usePlaygroundStore((s) => s.rawText);
  const ingestionLogs = usePlaygroundStore((s) => s.ingestionLogs);
  const uploadProgress = usePlaygroundStore((s) => s.uploadProgress);
  const isUploading = usePlaygroundStore((s) => s.isUploading);
  const sourceType = usePlaygroundStore((s) => s.sourceType);

  const setSourceType = usePlaygroundStore((s) => s.setSourceType);
  const loadSample = usePlaygroundStore((s) => s.loadSample);
  const startUploadSimulation = usePlaygroundStore((s) => s.startUploadSimulation);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3 space-y-4">
        <UploadDropzone
          disabled={isUploading}
          onPickFile={startUploadSimulation}
          onLoadSample={loadSample}
        />
        <SourceTypeCard sourceType={sourceType} onSetSourceType={setSourceType} />
        <FileDetailsCard file={file} />
        <MetadataCard file={file} />
      </div>

      <div className="col-span-6">
        <FilePreview text={rawText} />
      </div>

      <div className="col-span-3">
        <ProcessingLogs
          title="Side log panel"
          entries={ingestionLogs}
          progress={uploadProgress}
        />
      </div>
    </div>
  );
}

