import type { ChunkStrategy } from "@/types/pipeline";

export type Chunk = {
  id: string;
  index: number;
  text: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function chunkByCharacter(text: string, size: number, overlap: number): Chunk[] {
  const s = clamp(Math.floor(size), 1, 1000000);
  const o = clamp(Math.floor(overlap), 0, s - 1);
  const step = Math.max(1, s - o);

  const out: Chunk[] = [];
  for (let start = 0, idx = 0; start < text.length; start += step, idx++) {
    const piece = text.slice(start, start + s);
    if (!piece.trim()) continue;
    out.push({ id: crypto.randomUUID(), index: idx, text: piece });
  }
  return out;
}

function chunkBySentence(text: string, size: number, overlap: number): Chunk[] {
  const sentences =
    text
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  const maxSentences = clamp(Math.floor(size), 1, 10000);
  const ov = clamp(Math.floor(overlap), 0, maxSentences - 1);
  const step = Math.max(1, maxSentences - ov);

  const out: Chunk[] = [];
  for (let i = 0, idx = 0; i < sentences.length; i += step, idx++) {
    const piece = sentences.slice(i, i + maxSentences).join(" ");
    if (!piece.trim()) continue;
    out.push({ id: crypto.randomUUID(), index: idx, text: piece });
  }
  return out;
}

function chunkByTokenApprox(text: string, size: number, overlap: number): Chunk[] {
  // Approximate tokenization by splitting on whitespace.
  const tokens = text.split(/\s+/).filter(Boolean);
  const s = clamp(Math.floor(size), 1, 1000000);
  const o = clamp(Math.floor(overlap), 0, s - 1);
  const step = Math.max(1, s - o);

  const out: Chunk[] = [];
  for (let start = 0, idx = 0; start < tokens.length; start += step, idx++) {
    const piece = tokens.slice(start, start + s).join(" ");
    if (!piece.trim()) continue;
    out.push({ id: crypto.randomUUID(), index: idx, text: piece });
  }
  return out;
}

function chunkRecursive(text: string, size: number, overlap: number): Chunk[] {
  // Lightweight "recursive" strategy:
  // Try paragraphs first, then fall back to character chunking for long paragraphs.
  const paras = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const out: Chunk[] = [];
  let idx = 0;
  for (const p of paras) {
    if (p.length <= size) {
      out.push({ id: crypto.randomUUID(), index: idx++, text: p });
      continue;
    }
    const chunks = chunkByCharacter(p, size, overlap);
    chunks.forEach((c) => out.push({ ...c, index: idx++ }));
  }
  return out;
}

export function makeChunks(args: {
  text: string;
  strategy: ChunkStrategy;
  chunkSize: number;
  overlap: number;
}): { chunks: Chunk[]; warnings: string[] } {
  const text = args.text ?? "";
  const warnings: string[] = [];
  if (!text.trim()) return { chunks: [], warnings: ["No text available to chunk."] };

  switch (args.strategy) {
    case "character":
      return { chunks: chunkByCharacter(text, args.chunkSize, args.overlap), warnings };
    case "token":
      warnings.push("Token strategy is approximate (whitespace-based).");
      return { chunks: chunkByTokenApprox(text, args.chunkSize, args.overlap), warnings };
    case "sentence":
      warnings.push("Sentence strategy uses punctuation heuristics.");
      return { chunks: chunkBySentence(text, args.chunkSize, args.overlap), warnings };
    case "recursive":
      warnings.push("Recursive strategy uses paragraph + character fallback.");
      return { chunks: chunkRecursive(text, args.chunkSize, args.overlap), warnings };
    case "semantic":
      warnings.push("Semantic chunking is a placeholder in the tutorial UI for now.");
      return { chunks: chunkByCharacter(text, args.chunkSize, args.overlap), warnings };
    case "important":
      warnings.push("Important chunking is a placeholder in the tutorial UI for now.");
      return { chunks: chunkByCharacter(text, args.chunkSize, args.overlap), warnings };
  }
}

