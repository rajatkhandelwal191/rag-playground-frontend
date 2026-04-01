import { create } from "zustand";
import type {
  ChunkStrategy,
  EmbeddingModelId,
  EmbeddingProvider,
  DocumentMetadata,
  LogEntry,
  PipelineStageId,
  SourceType,
} from "@/types/pipeline";
import { buildSampleMetadata, SAMPLE_RAW_TEXT } from "@/lib/mockData";
import { makeChunks, type Chunk } from "@/lib/chunking";
import {
  defaultModelForProvider,
  generateMockEmbedding,
  modelDimension,
  projectTo2D,
  type EmbeddingVector,
  type VectorPoint2D,
} from "@/lib/embedding";

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

  chunkingOptions: {
    chunkSize: number;
    overlap: number;
    strategy: ChunkStrategy;
  };
  setChunkingOptions: (next: Partial<PlaygroundState["chunkingOptions"]>) => void;
  chunks: Chunk[];
  chunkingLogs: LogEntry[];

  embeddingOptions: {
    provider: EmbeddingProvider;
    model: EmbeddingModelId;
    batchSize: number;
  };
  setEmbeddingOptions: (next: Partial<PlaygroundState["embeddingOptions"]>) => void;
  embeddings: EmbeddingVector[];
  embeddingPoints2D: VectorPoint2D[];
  embeddingLogs: LogEntry[];

  setRawText: (text: string) => void;
  setCleanedText: (text: string) => void;
  setSourceType: (sourceType: SourceType) => void;

  addLog: (stage: PipelineStageId, message: string) => void;
  clearLogs: (stage: PipelineStageId) => void;

  loadSample: () => void;
  startUploadSimulation: (file: File) => void;

  generateChunks: () => void;

  generateEmbeddings: () => void;
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

  chunkingOptions: {
    chunkSize: 800,
    overlap: 120,
    strategy: "recursive",
  },
  setChunkingOptions: (next) =>
    set((state) => ({
      chunkingOptions: { ...state.chunkingOptions, ...next },
    })),
  chunks: [],
  chunkingLogs: [],

  embeddingOptions: {
    provider: "google",
    model: defaultModelForProvider("google"),
    batchSize: 16,
  },
  setEmbeddingOptions: (next) =>
    set((state) => ({
      embeddingOptions: { ...state.embeddingOptions, ...next },
    })),
  embeddings: [],
  embeddingPoints2D: [],
  embeddingLogs: [],

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
        : stage === "preprocessing"
          ? { preprocessingLogs: [...state.preprocessingLogs, entry] }
          : stage === "chunking"
            ? { chunkingLogs: [...state.chunkingLogs, entry] }
            : { embeddingLogs: [...state.embeddingLogs, entry] };
    }),

  clearLogs: (stage) =>
    set(() =>
      stage === "ingestion"
        ? { ingestionLogs: [] }
        : stage === "preprocessing"
          ? { preprocessingLogs: [] }
          : stage === "chunking"
            ? { chunkingLogs: [] }
            : { embeddingLogs: [] }
    ),

  loadSample: () =>
    set((state) => {
      const meta = buildSampleMetadata();
      return {
        sourceType: "sample",
        file: meta,
        rawText: SAMPLE_RAW_TEXT,
        cleanedText: "",
        chunks: [],
        chunkingLogs: [],
        embeddings: [],
        embeddingPoints2D: [],
        embeddingLogs: [],
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
      chunks: [],
      chunkingLogs: [],
      embeddings: [],
      embeddingPoints2D: [],
      embeddingLogs: [],
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

  generateChunks: () =>
    set((state) => {
      const text = (state.cleanedText || state.rawText).trim();
      const { chunks, warnings } = makeChunks({
        text,
        strategy: state.chunkingOptions.strategy,
        chunkSize: state.chunkingOptions.chunkSize,
        overlap: state.chunkingOptions.overlap,
      });

      const now = new Date().toISOString();
      const docId = state.file?.documentName ?? "unknown_document";
      const strategyLabel =
        state.chunkingOptions.strategy === "character"
          ? "character"
          : state.chunkingOptions.strategy === "token"
            ? "token"
            : state.chunkingOptions.strategy === "sentence"
              ? "sentence"
              : state.chunkingOptions.strategy === "recursive"
                ? "recursive"
                : state.chunkingOptions.strategy === "semantic"
                  ? "semantic"
                  : "important";

      const baseLogs: LogEntry[] = [
        { id: crypto.randomUUID(), tsISO: now, message: "Chunking started" },
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: `Using ${strategyLabel} splitter`,
        },
        ...warnings.map((w) => ({
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: w,
        })),
      ];

      const perChunkLogs: LogEntry[] = [];
      const perChunkCap = 200;
      if (chunks.length <= perChunkCap) {
        chunks.forEach((c) => {
          perChunkLogs.push({
            id: crypto.randomUUID(),
            tsISO: new Date().toISOString(),
            message: `Created ${c.chunkId}`,
          });
        });
      } else {
        perChunkLogs.push({
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: `Created ${chunks.length} chunks (suppressed per-chunk logs)`,
        });
      }

      const overlapLogs: LogEntry[] =
        state.chunkingOptions.overlap > 0
          ? [
              {
                id: crypto.randomUUID(),
                tsISO: new Date().toISOString(),
                message: "Overlap applied",
              },
            ]
          : [];

      const footerLogs: LogEntry[] = [
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: `Document id: ${docId}`,
        },
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: "Chunking completed",
        },
      ];

      return {
        chunks,
        chunkingLogs: [
          ...state.chunkingLogs,
          ...baseLogs,
          ...perChunkLogs,
          ...overlapLogs,
          ...footerLogs,
        ],
      };
    }),

  generateEmbeddings: () =>
    set((state) => {
      const docId = state.file?.documentName ?? "unknown_document";
      const provider = state.embeddingOptions.provider;
      const model = state.embeddingOptions.model;
      const dim = modelDimension(model);
      const batchSize = Math.max(1, Math.floor(state.embeddingOptions.batchSize || 1));

      const chunks = state.chunks;
      if (!chunks.length) {
        const e: LogEntry = {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: "No chunks available to embed",
        };
        return { embeddingLogs: [...state.embeddingLogs, e] };
      }

      const logs: LogEntry[] = [
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: "Generating embeddings",
        },
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: `Embedding provider: ${provider}`,
        },
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: `Embedding model: ${model}`,
        },
      ];

      const embeddings: EmbeddingVector[] = [];
      const totalBatches = Math.ceil(chunks.length / batchSize);
      for (let b = 0; b < totalBatches; b++) {
        const slice = chunks.slice(b * batchSize, (b + 1) * batchSize);
        slice.forEach((c) => {
          embeddings.push(
            generateMockEmbedding({
              provider,
              model,
              chunkId: c.chunkId,
              documentId: docId,
            })
          );
        });
        const latencyAvg =
          Math.round(
            slice.reduce((a, c) => {
              const v = embeddings.find((e) => e.chunkId === c.chunkId);
              return a + (v?.latencyMs ?? 0);
            }, 0) / Math.max(1, slice.length)
          ) || 0;
        logs.push({
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: `Batch ${b + 1} complete`,
        });
        logs.push({
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: `Latency ${latencyAvg}ms`,
        });
      }

      logs.push({
        id: crypto.randomUUID(),
        tsISO: new Date().toISOString(),
        message: `Vector size ${dim}`,
      });

      const points = projectTo2D(embeddings);
      logs.push({
        id: crypto.randomUUID(),
        tsISO: new Date().toISOString(),
        message: "2D projection generated",
      });

      return {
        embeddings,
        embeddingPoints2D: points,
        embeddingLogs: [...state.embeddingLogs, ...logs],
      };
    }),
}));