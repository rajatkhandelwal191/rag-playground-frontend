export type PipelineStageId = "ingestion" | "preprocessing" | "chunking";

export type SourceType = "upload" | "sample";

export type ChunkStrategy =
  | "character"
  | "token"
  | "sentence"
  | "recursive"
  | "semantic"
  | "important";

export interface DocumentMetadata {
  documentName: string;
  fileType: "PDF" | "DOCX" | "TXT";
  pages?: number;
  characters: number;
  tokensEstimated: number;
  uploadTimeISO: string;
  language: string;
  source: SourceType;
}

export interface LogEntry {
  id: string;
  tsISO: string;
  message: string;
}

