export type PipelineStageId = "ingestion" | "preprocessing";

export type SourceType = "upload" | "sample";

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

