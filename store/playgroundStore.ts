import { create } from "zustand";
import type { DocumentMetadata, LogEntry, PipelineStageId, SourceType } from "@/types/pipeline";
import { buildSampleMetadata, SAMPLE_RAW_TEXT } from "@/lib/mockData";

interface PlaygroundState {
  stage: PipelineStageId;
  setStage: (stage: PipelineStageId) => void;

  rawText: string;
  cleanedText: string;
  file: DocumentMetadata | null;
  sourceType: SourceType;
  ingestionLogs: LogEntry[];
  preprocessingLogs: LogEntry[];
  uploadProgress: number;
  isUploading: boolean;

  preprocessingOptions: {
    lowercase: boolean;
    preservePunctuation: boolean;
    ocrCleanup: boolean;
  };
  setPreprocessingOptions: (
    next: Partial<PlaygroundState["preprocessingOptions"]>
  ) => void;

  setRawText: (text: string) => void;
  setCleanedText: (text: string) => void;
  setSourceType: (sourceType: SourceType) => void;

  addLog: (stage: PipelineStageId, message: string) => void;
  clearLogs: (stage: PipelineStageId) => void;

  loadSample: () => void;
  startUploadSimulation: (file: File) => void;
}

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
  stage: "ingestion",
  setStage: (stage) => set({ stage }),

  rawText: "",
  cleanedText: "",
  file: null,
  sourceType: "upload",
  ingestionLogs: [],
  preprocessingLogs: [],
  uploadProgress: 0,
  isUploading: false,

  preprocessingOptions: {
    lowercase: false,
    preservePunctuation: true,
    ocrCleanup: true,
  },
  setPreprocessingOptions: (next) =>
    set((state) => ({
      preprocessingOptions: { ...state.preprocessingOptions, ...next },
    })),

  setRawText: (text) => set({ rawText: text }),
  setCleanedText: (text) => set({ cleanedText: text }),

  setSourceType: (sourceType) => set({ sourceType }),

  addLog: (stage, message) =>
    set((state) => {
      const entry: LogEntry = {
        id: crypto.randomUUID(),
        tsISO: new Date().toISOString(),
        message,
      };
      return stage === "ingestion"
        ? { ingestionLogs: [...state.ingestionLogs, entry] }
        : { preprocessingLogs: [...state.preprocessingLogs, entry] };
    }),

  clearLogs: (stage) =>
    set(() =>
      stage === "ingestion" ? { ingestionLogs: [] } : { preprocessingLogs: [] }
    ),

  loadSample: () =>
    set((state) => {
      const meta = buildSampleMetadata();
      return {
        sourceType: "sample",
        file: meta,
        rawText: SAMPLE_RAW_TEXT,
        cleanedText: "",
        ingestionLogs: [
          ...state.ingestionLogs,
          {
            id: crypto.randomUUID(),
            tsISO: new Date().toISOString(),
            message: "Sample data loaded",
          },
        ],
        stage: "preprocessing",
      };
    }),

  startUploadSimulation: (file) => {
    const uploadTimeISO = new Date().toISOString();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const fileType = ext === "pdf" ? "PDF" : ext === "docx" ? "DOCX" : "TXT";

    set((state) => ({
      sourceType: "upload",
      isUploading: true,
      uploadProgress: 0,
      ingestionLogs: [
        ...state.ingestionLogs,
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: "Uploading file...",
        },
      ],
      file: {
        documentName: file.name,
        fileType,
        pages: fileType === "PDF" ? 2 : 1,
        characters: 0,
        tokensEstimated: 0,
        uploadTimeISO,
        language: "Unknown",
        source: "upload",
      },
      rawText: "",
      cleanedText: "",
    }));

    const steps: Array<{ t: number; progress: number; msg?: string }> = [
      { t: 450, progress: 18, msg: "File received" },
      { t: 950, progress: 35, msg: "Text extraction started" },
      { t: 1400, progress: 55, msg: "Page 1 extracted" },
      { t: 1850, progress: 72, msg: "Page 2 extracted" },
      { t: 2400, progress: 90, msg: "Extraction completed" },
    ];

    steps.forEach(({ t, progress, msg }) => {
      window.setTimeout(() => {
        set((state) => ({
          uploadProgress: progress,
          ingestionLogs: msg
            ? [
                ...state.ingestionLogs,
                {
                  id: crypto.randomUUID(),
                  tsISO: new Date().toISOString(),
                  message: msg,
                },
              ]
            : state.ingestionLogs,
        }));
      }, t);
    });

    window.setTimeout(() => {
      const extractedText =
        `Extracted text from ${file.name}\n\n` +
        "This is placeholder extracted content.\n" +
        "Replace this later with real PDF/DOCX parsing.\n";
      const characters = extractedText.length;
      const tokensEstimated = Math.max(1, Math.round(characters / 4));

      set((state) => ({
        isUploading: false,
        uploadProgress: 100,
        rawText: extractedText,
        file: state.file
          ? {
              ...state.file,
              characters,
              tokensEstimated,
              language: "English",
            }
          : null,
        stage: "preprocessing",
      }));
    }, 2850);
  },
}));