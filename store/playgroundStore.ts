import { create } from "zustand";
import type {
  ChunkStrategy,
  DistanceMetric,
  EmbeddingModelId,
  EmbeddingProvider,
  DocumentMetadata,
  LogEntry,
  PipelineStageId,
  RetrievalResult,
  RerankingResult,
  SourceType,
  LLMProvider,
  LLMModelId,
  PromptTemplateId,
  GenerationResult,
  EvaluationMetrics,
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
import { simulateIndexingLatency, type IndexStats } from "@/lib/indexing";
import { simulateRetrieval } from "@/lib/retrieval";
import { simulateReranking } from "@/lib/reranking";
import { simulateGeneration, defaultModelForLLMProvider, PROMPT_TEMPLATES } from "@/lib/generation";

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

  indexingOptions: {
    collectionName: string;
    distanceMetric: DistanceMetric;
  };
  setIndexingOptions: (next: Partial<PlaygroundState["indexingOptions"]>) => void;
  indexStats: IndexStats | null;
  indexingLogs: LogEntry[];

  retrievalOptions: {
    query: string;
    topK: number;
    scoreThreshold: number;
    metadataFilter: string;
  };
  setRetrievalOptions: (
    next: Partial<PlaygroundState["retrievalOptions"]>
  ) => void;
  retrievalResults: RetrievalResult[];
  retrievalLogs: LogEntry[];
  rerankingOptions: {
    topK: number;
  };
  setRerankingOptions: (
    next: Partial<PlaygroundState["rerankingOptions"]>
  ) => void;
  rerankedResults: RerankingResult[];
  rerankingLogs: LogEntry[];

  generationOptions: {
    provider: LLMProvider;
    model: LLMModelId;
    promptTemplate: PromptTemplateId;
    temperature: number;
    maxTokens: number;
  };
  setGenerationOptions: (
    next: Partial<PlaygroundState["generationOptions"]>
  ) => void;
  generationResult: GenerationResult | null;
  generationLogs: LogEntry[];
  isGenerating: boolean;
  currentResponse: string;
  generateResponse: () => void;
  resetGeneration: () => void;

  evaluationMetrics: EvaluationMetrics | null;
  evaluationLogs: LogEntry[];
  calculateMetrics: () => void;
  resetEvaluation: () => void;

  indexVectors: () => void;
  retrieve: () => void;
  rerank: () => void;

  setRawText: (text: string) => void;
  setCleanedText: (text: string) => void;
  setSourceType: (sourceType: SourceType) => void;

  addLog: (stage: PipelineStageId, message: string) => void;
  clearLogs: (stage: PipelineStageId) => void;

  loadSample: () => void;
  startUploadSimulation: (file: File) => void;

  generateChunks: () => void;

  generateEmbeddings: () => void;
  // indexVectors is declared above with indexing state
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

  indexingOptions: {
    collectionName: "rag_playground_chunks",
    distanceMetric: "cosine",
  },
  setIndexingOptions: (next) =>
    set((state) => ({
      indexingOptions: { ...state.indexingOptions, ...next },
    })),
  indexStats: null,
  indexingLogs: [],

  retrievalOptions: {
    query: "",
    topK: 5,
    scoreThreshold: 0.75,
    metadataFilter: "",
  },
  setRetrievalOptions: (next) =>
    set((state) => ({
      retrievalOptions: { ...state.retrievalOptions, ...next },
    })),
  retrievalResults: [],
  retrievalLogs: [],
  rerankingOptions: {
    topK: 3,
  },
  setRerankingOptions: (next) =>
    set((state) => ({
      rerankingOptions: { ...state.rerankingOptions, ...next },
    })),
  rerankedResults: [],
  rerankingLogs: [],

  generationOptions: {
    provider: "openai",
    model: defaultModelForLLMProvider("openai"),
    promptTemplate: "basic-qa",
    temperature: 0.7,
    maxTokens: 1024,
  },
  setGenerationOptions: (next) =>
    set((state) => ({
      generationOptions: { ...state.generationOptions, ...next },
    })),
  generationResult: null,
  generationLogs: [],
  isGenerating: false,
  currentResponse: "",

  evaluationMetrics: null,
  evaluationLogs: [],

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
            : stage === "embedding"
              ? { embeddingLogs: [...state.embeddingLogs, entry] }
              : stage === "indexing"
                ? { indexingLogs: [...state.indexingLogs, entry] }
                : stage === "retrieval"
                  ? { retrievalLogs: [...state.retrievalLogs, entry] }
                  : stage === "reranking"
                    ? { rerankingLogs: [...state.rerankingLogs, entry] }
                    : stage === "generation"
                      ? { generationLogs: [...state.generationLogs, entry] }
                      : { evaluationLogs: [...state.evaluationLogs, entry] };
    }),

  clearLogs: (stage) =>
    set(() =>
      stage === "ingestion"
        ? { ingestionLogs: [] }
        : stage === "preprocessing"
          ? { preprocessingLogs: [] }
          : stage === "chunking"
            ? { chunkingLogs: [] }
            : stage === "embedding"
              ? { embeddingLogs: [] }
              : stage === "indexing"
                ? { indexingLogs: [] }
                : stage === "retrieval"
                  ? { retrievalLogs: [] }
                  : stage === "reranking"
                    ? { rerankingLogs: [] }
                    : stage === "generation"
                      ? { generationLogs: [] }
                      : { evaluationLogs: [] }
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
        indexStats: null,
        indexingLogs: [],
        retrievalResults: [],
        retrievalLogs: [],
        rerankedResults: [],
        rerankingLogs: [],
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
      indexStats: null,
      indexingLogs: [],
      retrievalResults: [],
      retrievalLogs: [],
      rerankedResults: [],
      rerankingLogs: [],
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

  indexVectors: () =>
    set((state) => {
      const vectors = state.embeddings;
      const collectionName =
        state.indexingOptions.collectionName.trim() || "rag_playground_chunks";
      const distanceMetric = state.indexingOptions.distanceMetric;
      const docId = state.file?.documentName ?? "unknown_document";
      const documentCount = state.file ? 1 : 0;

      if (!vectors.length) {
        const e: LogEntry = {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: "No embeddings available to index",
        };
        return { indexingLogs: [...state.indexingLogs, e] };
      }

      const latencyMs = simulateIndexingLatency({
        vectorCount: vectors.length,
        batchSize: state.embeddingOptions.batchSize,
      });

      const stats: IndexStats = {
        collectionName,
        vectorCount: vectors.length,
        totalChunks: state.chunks.length,
        documentCount,
        indexingLatencyMs: latencyMs,
        distanceMetric,
      };

      const logs: LogEntry[] = [
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: "Indexing started",
        },
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: `Collection name: ${collectionName}`,
        },
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: `Distance metric: ${distanceMetric}`,
        },
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: `Indexing latency ${latencyMs}ms`,
        },
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: `Vectors upserted: ${vectors.length}`,
        },
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: `Document id: ${docId}`,
        },
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: "Indexing completed",
        },
      ];

      return {
        indexStats: stats,
        indexingLogs: [...state.indexingLogs, ...logs],
      };
    }),

  retrieve: () =>
    set((state) => {
      const query = state.retrievalOptions.query.trim();
      const docName = state.file?.documentName ?? "unknown_document";

      if (!query) {
        return {
          retrievalLogs: [
            ...state.retrievalLogs,
            {
              id: crypto.randomUUID(),
              tsISO: new Date().toISOString(),
              message: "Please enter a search query",
            },
          ],
        };
      }

      if (!state.chunks.length) {
        return {
          retrievalLogs: [
            ...state.retrievalLogs,
            {
              id: crypto.randomUUID(),
              tsISO: new Date().toISOString(),
              message: "No index available to search. Please complete the indexing stage first.",
            },
          ],
        };
      }

      const { results, logs } = simulateRetrieval({
        query,
        chunks: state.chunks,
        options: {
          query,
          topK: state.retrievalOptions.topK,
          scoreThreshold: state.retrievalOptions.scoreThreshold,
          metadataFilter: state.retrievalOptions.metadataFilter,
        },
        documentName: docName,
      });

      return {
        retrievalResults: results,
        retrievalLogs: [...state.retrievalLogs, ...logs],
        rerankedResults: [],
        rerankingLogs: [],
      };
    }),

  rerank: () =>
    set((state) => {
      if (!state.retrievalResults.length) {
        return {
          rerankingLogs: [
            ...state.rerankingLogs,
            {
              id: crypto.randomUUID(),
              tsISO: new Date().toISOString(),
              message: "No retrieval results found. Run retrieval first.",
            },
          ],
        };
      }

      const top10 = [...state.retrievalResults]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      const { results, logs } = simulateReranking({
        query: state.retrievalOptions.query.trim(),
        retrieved: top10,
        topK: state.rerankingOptions.topK,
      });

      return {
        rerankedResults: results,
        rerankingLogs: [...state.rerankingLogs, ...logs],
      };
    }),

  generateResponse: () =>
    set((state) => {
      const query = state.retrievalOptions.query.trim();
      
      if (!query) {
        return {
          generationLogs: [
            ...state.generationLogs,
            {
              id: crypto.randomUUID(),
              tsISO: new Date().toISOString(),
              message: "Please enter a search query in the retrieval stage first",
            },
          ],
        };
      }

      const chunksToUse = state.rerankedResults.length > 0 
        ? state.rerankedResults 
        : state.retrievalResults;
      
      if (!chunksToUse.length) {
        return {
          generationLogs: [
            ...state.generationLogs,
            {
              id: crypto.randomUUID(),
              tsISO: new Date().toISOString(),
              message: "No retrieved chunks available. Run retrieval first.",
            },
          ],
        };
      }

      const { result, logs } = simulateGeneration({
        query,
        chunks: chunksToUse,
        options: {
          provider: state.generationOptions.provider,
          model: state.generationOptions.model,
          promptTemplate: state.generationOptions.promptTemplate,
          temperature: state.generationOptions.temperature,
          maxTokens: state.generationOptions.maxTokens,
        },
      });

      return {
        isGenerating: true,
        generationResult: result,
        generationLogs: [...state.generationLogs, ...logs],
      };
    }),

  resetGeneration: () =>
    set({
      generationResult: null,
      generationLogs: [],
      isGenerating: false,
      currentResponse: "",
    }),

  calculateMetrics: () =>
    set((state) => {
      if (!state.generationResult) {
        return {
          evaluationLogs: [
            ...state.evaluationLogs,
            {
              id: crypto.randomUUID(),
              tsISO: new Date().toISOString(),
              message: "No generation result available. Run generation first.",
            },
          ],
        };
      }

      const result = state.generationResult;
      const chunksUsed = result.chunksUsed;
      const inputTokens = result.inputTokens;
      const outputTokens = result.outputTokens;
      const latency = result.latencyMs;

      // Calculate estimated cost based on provider and tokens
      const provider = state.generationOptions.provider;
      const inputCostPer1K =
        provider === "openai" ? 0.005 : provider === "anthropic" ? 0.008 : provider === "google" ? 0.0035 : 0;
      const outputCostPer1K =
        provider === "openai" ? 0.015 : provider === "anthropic" ? 0.024 : provider === "google" ? 0.0105 : 0;
      const estimatedCost = (inputTokens / 1000) * inputCostPer1K + (outputTokens / 1000) * outputCostPer1K;

      // Calculate confidence based on retrieval scores
      const chunksToUse = state.rerankedResults.length > 0 ? state.rerankedResults : state.retrievalResults;
      const avgScore = chunksToUse.length > 0
        ? chunksToUse.reduce((acc, c) => acc + (("rerankedScore" in c && typeof c.rerankedScore === "number") ? c.rerankedScore : c.score), 0) / chunksToUse.length
        : 0;
      const confidence = Math.min(100, Math.round(avgScore * 100));

      // Calculate faithfulness (how well response uses context)
      const faithfulness = Math.min(100, Math.round(70 + Math.random() * 25));

      // Calculate relevance (how well response matches query)
      const relevance = Math.min(100, Math.round(65 + Math.random() * 30));

      // Calculate context utilization
      const contextUtilization = Math.min(100, Math.round((chunksUsed / 5) * 100));

      // Calculate overall response quality
      const responseQuality = Math.round((confidence + faithfulness + relevance) / 3);

      const metrics: EvaluationMetrics = {
        latency,
        inputTokens,
        outputTokens,
        estimatedCost: Math.round(estimatedCost * 10000) / 10000,
        confidence,
        faithfulness,
        relevance,
        contextUtilization,
        responseQuality,
      };

      const logs: LogEntry[] = [
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: "Evaluation started",
        },
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: `Latency: ${latency}ms`,
        },
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: `Input tokens: ${inputTokens}`,
        },
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: `Output tokens: ${outputTokens}`,
        },
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: `Estimated cost: $${estimatedCost.toFixed(4)}`,
        },
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: `Confidence: ${confidence}%`,
        },
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: `Faithfulness: ${faithfulness}%`,
        },
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: `Relevance: ${relevance}%`,
        },
        {
          id: crypto.randomUUID(),
          tsISO: new Date().toISOString(),
          message: "Evaluation completed",
        },
      ];

      return {
        evaluationMetrics: metrics,
        evaluationLogs: [...state.evaluationLogs, ...logs],
      };
    }),

  resetEvaluation: () =>
    set({
      evaluationMetrics: null,
      evaluationLogs: [],
    }),
}));
