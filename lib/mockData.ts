import type { DocumentMetadata } from "@/types/pipeline";

export const SAMPLE_RAW_TEXT = `RAG Playground — Sample Document

This is sample content used to demonstrate ingestion and preprocessing.

Section 1
  - Bullet A
  - Bullet B

Section 2
Extra     spaces and line breaks.
`;

export function buildSampleMetadata(): DocumentMetadata {
  const characters = SAMPLE_RAW_TEXT.length;
  const tokensEstimated = Math.max(1, Math.round(characters / 4));

  return {
    documentId: "sample-doc-001",
    documentName: "sample-document.txt",
    fileType: "TXT",
    pages: 1,
    characters,
    tokensEstimated,
    uploadTimeISO: new Date().toISOString(),
    language: "English",
    source: "sample",
  };
}
