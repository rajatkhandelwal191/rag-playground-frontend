import type { LogEntry, RetrievalResult, RerankingResult } from "@/types/pipeline";

export function simulateReranking(args: {
  query: string;
  retrieved: RetrievalResult[];
  topK: number;
}): { results: RerankingResult[]; logs: LogEntry[] } {
  const logs: LogEntry[] = [];
  const addLog = (message: string) => {
    logs.push({
      id: crypto.randomUUID(),
      tsISO: new Date().toISOString(),
      message,
    });
  };

  const query = args.query.trim().toLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);
  addLog(`Retrieved top ${args.retrieved.length}`);
  addLog("Running cross-encoder reranker");

  const reranked = args.retrieved.map((item, index) => {
    const text = item.content.toLowerCase();
    const termMatches = terms.length
      ? terms.filter((term) => text.includes(term)).length / terms.length
      : 0;
    const rerankedScore = Math.min(
      0.99,
      Math.max(0.01, item.score * 0.45 + termMatches * 0.5 + Math.random() * 0.05)
    );

    return {
      ...item,
      initialRank: index + 1,
      rerankedRank: 0,
      initialScore: item.score,
      rerankedScore,
    };
  });

  reranked.sort((a, b) => b.rerankedScore - a.rerankedScore);
  const top = reranked.slice(0, Math.max(1, args.topK)).map((item, index) => ({
    ...item,
    rerankedRank: index + 1,
  }));

  addLog(`Reranked top ${top.length}`);
  addLog(`Completed in ${Math.floor(80 + Math.random() * 120)}ms`);
  return { results: top, logs };
}
