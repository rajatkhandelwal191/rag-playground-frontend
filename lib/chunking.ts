import type { ChunkStrategy } from "@/types/pipeline";

export type Chunk = {
  id: string;
  chunkId: string;
  index: number;
  start: number;
  end: number;
  tokenCount: number;
  text: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function countTokensApprox(s: string) {
  return (s.trim().match(/\S+/g) ?? []).length;
}

function makeChunk(args: {
  index: number;
  start: number;
  end: number;
  text: string;
}): Chunk {
  return {
    id: crypto.randomUUID(),
    chunkId: `chunk_${String(args.index + 1).padStart(3, "0")}`,
    index: args.index,
    start: args.start,
    end: args.end,
    tokenCount: countTokensApprox(args.text),
    text: args.text,
  };
}

function chunkByCharacter(text: string, size: number, overlap: number): Chunk[] {
  const s = clamp(Math.floor(size), 1, 1000000);
  const o = clamp(Math.floor(overlap), 0, s - 1);
  const step = Math.max(1, s - o);

  const out: Chunk[] = [];
  for (let start = 0, idx = 0; start < text.length; start += step, idx++) {
    const end = Math.min(text.length, start + s);
    const piece = text.slice(start, end);
    if (!piece.trim()) continue;
    out.push(makeChunk({ index: idx, start, end, text: piece }));
  }
  return out;
}

function locatePiece(text: string, piece: string, fromIndex: number) {
  const idx = text.indexOf(piece, fromIndex);
  return idx;
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
  let cursor = 0;
  for (let i = 0, idx = 0; i < sentences.length; i += step, idx++) {
    const piece = sentences.slice(i, i + maxSentences).join(" ");
    if (!piece.trim()) continue;
    const start = locatePiece(text, piece, cursor);
    const end = start >= 0 ? start + piece.length : -1;
    if (start >= 0) cursor = end;
    out.push(
      makeChunk({
        index: idx,
        start: start >= 0 ? start : -1,
        end: end >= 0 ? end : -1,
        text: piece,
      })
    );
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
  let cursor = 0;
  for (let start = 0, idx = 0; start < tokens.length; start += step, idx++) {
    const piece = tokens.slice(start, start + s).join(" ");
    if (!piece.trim()) continue;
    const pos = locatePiece(text, piece, cursor);
    const end = pos >= 0 ? pos + piece.length : -1;
    if (pos >= 0) cursor = end;
    out.push(
      makeChunk({
        index: idx,
        start: pos >= 0 ? pos : -1,
        end: end >= 0 ? end : -1,
        text: piece,
      })
    );
  }
  return out;
}

function chunkRecursive(text: string, size: number, overlap: number): Chunk[] {
  // Lightweight "recursive" strategy:
  // Try paragraphs first, then fall back to character chunking for long paragraphs.
  // Build paragraph segments with offsets without using regex dotAll flag.
  const paraMatches: Array<{ index: number; raw: string }> = [];
  const parts = text.split(/\n{2,}/);
  let offset = 0;
  for (const part of parts) {
    const idx = text.indexOf(part, offset);
    if (idx >= 0) {
      paraMatches.push({ index: idx, raw: part });
      offset = idx + part.length;
    }
  }

  const out: Chunk[] = [];
  let idx = 0;
  for (const m of paraMatches) {
    const raw = m.raw ?? "";
    const baseStart = m.index ?? 0;
    const lead = raw.search(/\S/);
    const trail = raw.trimEnd().length;
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const startOffset = baseStart + Math.max(0, lead);
    const endOffset = baseStart + Math.max(0, trail);

    if (trimmed.length <= size) {
      out.push(makeChunk({ index: idx++, start: startOffset, end: endOffset, text: trimmed }));
      continue;
    }
    const s = clamp(Math.floor(size), 1, 1000000);
    const o = clamp(Math.floor(overlap), 0, s - 1);
    const step = Math.max(1, s - o);
    for (let localStart = 0; localStart < trimmed.length; localStart += step) {
      const localEnd = Math.min(trimmed.length, localStart + s);
      const piece = trimmed.slice(localStart, localEnd);
      if (!piece.trim()) continue;
      out.push(
        makeChunk({
          index: idx++,
          start: startOffset + localStart,
          end: startOffset + localEnd,
          text: piece,
        })
      );
    }
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

