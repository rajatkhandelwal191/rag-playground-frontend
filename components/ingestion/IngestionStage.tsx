"use client";

import { useCallback } from "react";
import UploadDropzone from "@/components/ingestion/UploadDropzone";
import FileDetailsCard from "@/components/ingestion/FileDetailsCard";
import FilePreview from "@/components/ingestion/FilePreview";
import MetadataCard from "@/components/ingestion/MetadataCard";
import SourceTypeCard from "@/components/ingestion/SourceTypeCard";
import ProcessingLogs from "@/components/preprocessing/ProcessingLogs";
import { usePlaygroundStore } from "@/store/playgroundStore";
import { uploadFile } from "@/lib/api";

export default function IngestionStage() {
  const file = usePlaygroundStore((s) => s.file);
  const rawText = usePlaygroundStore((s) => s.rawText);
  const ingestionLogs = usePlaygroundStore((s) => s.ingestionLogs);
  const uploadProgress = usePlaygroundStore((s) => s.uploadProgress);
  const isUploading = usePlaygroundStore((s) => s.isUploading);
  const sourceType = usePlaygroundStore((s) => s.sourceType);
  const useBackend = usePlaygroundStore((s) => s.useBackend);

  const setSourceType = usePlaygroundStore((s) => s.setSourceType);
  const loadSample = usePlaygroundStore((s) => s.loadSample);
  const startUploadSimulation = usePlaygroundStore((s) => s.startUploadSimulation);
  const setRawText = usePlaygroundStore((s) => s.setRawText);
  const setFile = usePlaygroundStore((s) => s.setFile);
  const addLog = usePlaygroundStore((s) => s.addLog);
  const setStage = usePlaygroundStore((s) => s.setStage);

  const handleFileUpload = useCallback(async (uploadedFile: File) => {
    if (useBackend) {
      // Use backend API
      addLog("ingestion", "Uploading file to backend...");
      try {
        const result = await uploadFile(uploadedFile);
        addLog("ingestion", `File uploaded: ${result.document_name}`);
        addLog("ingestion", `Document ID: ${result.document_id}`);
        addLog("ingestion", `Size: ${result.file_size} bytes`);
        
        // Map backend response to DocumentMetadata
        const fileTypeMap: Record<string, "PDF" | "DOCX" | "TXT"> = {
          "pdf": "PDF",
          "text": "TXT",
          "markdown": "TXT",
          "html": "TXT",
        };
        
        const characters = result.raw_text.length;
        const tokensEstimated = Math.max(1, Math.round(characters / 4));
        
        setFile({
          documentId: result.document_id,
          documentName: result.document_name,
          fileType: fileTypeMap[result.source_type] || "TXT",
          pages: result.metadata.page_count,
          characters,
          tokensEstimated,
          uploadTimeISO: result.created_at,
          language: "English", // Could be detected from backend in future
          source: "upload",
        });
        
        setRawText(result.raw_text);
        addLog("ingestion", "Text extracted successfully");
        setStage("preprocessing");
      } catch (error) {
        addLog("ingestion", `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    } else {
      // Use local simulation
      startUploadSimulation(uploadedFile);
    }
  }, [useBackend, addLog, setFile, setRawText, setStage, startUploadSimulation]);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3 space-y-4">
        <UploadDropzone
          disabled={isUploading}
          onPickFile={handleFileUpload}
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

