import type {
  LogEntry,
  LLMProvider,
  LLMModelId,
  PromptTemplateId,
  PromptTemplate,
  GenerationResult,
  RetrievalResult,
} from "@/types/pipeline";

export const PROMPT_TEMPLATES: Record<PromptTemplateId, PromptTemplate> = {
  "basic-qa": {
    id: "basic-qa",
    name: "Basic Q&A",
    description: "Standard question-answering with context",
    systemPrompt:
      "You are a helpful assistant. Answer the user's question based on the provided context. Be concise and accurate.",
    userPromptTemplate: `Context:
{{context}}

Question: {{query}}

Answer:`,
  },
  "strict-grounded": {
    id: "strict-grounded",
    name: "Strict Grounded",
    description: "Only answer if information is in the context",
    systemPrompt:
      "You are a helpful assistant. Answer the user's question based ONLY on the provided context. If the answer cannot be found in the context, say \"I don't have enough information to answer this question.\"",
    userPromptTemplate: `Context:
{{context}}

Question: {{query}}

Answer (based only on the provided context):`,
  },
  "cited-answer": {
    id: "cited-answer",
    name: "Cited Answer",
    description: "Answer with citations to source chunks",
    systemPrompt:
      "You are a helpful assistant. Answer the user's question based on the provided context. Include citations to the relevant chunks using [chunk_id] format.",
    userPromptTemplate: `Context:
{{context}}

Question: {{query}}

Provide a detailed answer with citations [chunk_id]:

Answer:`,
  },
  summarization: {
    id: "summarization",
    name: "Summarization",
    description: "Summarize the retrieved content",
    systemPrompt:
      "You are a helpful assistant. Summarize the key points from the provided context in a clear and concise manner.",
    userPromptTemplate: `Context:
{{context}}

Task: Summarize the key points from the above context.

Summary:`,
  },
  "context-window": {
    id: "context-window",
    name: "Context Window",
    description: "Show how context fits in token window",
    systemPrompt:
      "You are demonstrating how retrieved chunks fill the context window. Acknowledge the chunks and briefly mention what you would answer.",
    userPromptTemplate: `Context window ({{tokenCount}} tokens):
{{context}}

User query: {{query}}

Demonstration of context window utilization:
- Number of chunks: {{chunkCount}}
- Total tokens: {{tokenCount}}

Brief response:`,
  },
};

export function defaultModelForLLMProvider(provider: LLMProvider): LLMModelId {
  switch (provider) {
    case "openai":
      return "gpt-4o-mini";
    case "anthropic":
      return "claude-3-haiku";
    case "google":
      return "gemini-1.5-flash";
    case "local":
      return "llama-3.1-8b";
  }
}

function countTokensApprox(text: string): number {
  // Rough approximation: ~4 characters per token on average
  return Math.ceil(text.length / 4);
}

function formatContext(
  chunks: RetrievalResult[],
  template: PromptTemplateId
): string {
  if (template === "cited-answer") {
    return chunks
      .map((chunk) => `[${chunk.chunkId}] ${chunk.content}`)
      .join("\n\n");
  }
  return chunks.map((chunk) => chunk.content).join("\n\n");
}

function buildPrompt(
  query: string,
  chunks: RetrievalResult[],
  template: PromptTemplateId
): { systemPrompt: string; userPrompt: string; tokenCount: number } {
  const promptTemplate = PROMPT_TEMPLATES[template];
  const context = formatContext(chunks, template);

  const userPrompt = promptTemplate.userPromptTemplate
    .replace("{{context}}", context)
    .replace("{{query}}", query)
    .replace("{{chunkCount}}", String(chunks.length))
    .replace("{{tokenCount}}", String(countTokensApprox(context + query)));

  const tokenCount =
    countTokensApprox(promptTemplate.systemPrompt) +
    countTokensApprox(userPrompt);

  return {
    systemPrompt: promptTemplate.systemPrompt,
    userPrompt,
    tokenCount,
  };
}

function generateMockResponse(
  query: string,
  chunks: RetrievalResult[],
  template: PromptTemplateId
): string {
  const chunkCount = chunks.length;
  const preview =
    chunks[0]?.content.slice(0, 100).replace(/\n/g, " ") + "..." || "N/A";

  const responses: Record<PromptTemplateId, string> = {
    "basic-qa": `Based on the ${chunkCount} retrieved chunk${chunkCount > 1 ? "s" : ""}, I can answer your question about "${query}".

The retrieved context includes information from ${chunks.map((c) => c.chunkId).join(", ")}. The first chunk begins with: "${preview}"

This is a simulated LLM response demonstrating how the RAG system would generate an answer based on the retrieved context. In a real implementation, this would be a meaningful answer derived from the provided context.`,

    "strict-grounded": `Based ONLY on the provided context from ${chunkCount} chunk${chunkCount > 1 ? "s" : ""}, I can provide the following answer:

The retrieved information includes content from ${chunks.map((c) => c.chunkId).join(", ")}. Here's what the context tells us about "${query}":

[This is a simulated response demonstrating strict grounding in retrieved context only. In a real implementation, the LLM would carefully verify that all statements are supported by the provided text.]

Key finding: The first chunk contains: "${preview}"`,

    "cited-answer": `Based on the retrieved context, here is a detailed answer with citations:

According to [${chunks[0]?.chunkId || "chunk_001"}], the context discusses topics related to your query "${query}". ${
      chunks[1]
        ? `Additionally, [${chunks[1].chunkId}] provides supporting information.`
        : ""
    } ${
      chunks[2]
        ? `Furthermore, [${chunks[2].chunkId}] adds relevant details.`
        : ""
    }

This response demonstrates how an LLM would cite specific chunks when providing an answer. Each citation [chunk_id] allows users to verify the source of information in the retrieved context.`,

    summarization: `Summary of the retrieved content (${chunkCount} chunk${chunkCount > 1 ? "s" : ""}):

**Key Points:**

1. The retrieved content from ${chunks.map((c) => c.chunkId).join(", ")} contains relevant information.

2. The first chunk begins with: "${preview}"

3. ${
      chunks.length > 1
        ? `Multiple chunks (${chunkCount}) were retrieved and combined to provide comprehensive coverage.`
        : "A single chunk was retrieved as the most relevant match."
    }

This summary demonstrates how the LLM synthesizes information across multiple retrieved chunks.`,

    "context-window": `Context Window Analysis:

📊 **Window Utilization:**
- Chunks loaded: ${chunkCount}
- Context tokens: ~${countTokensApprox(
      chunks.map((c) => c.content).join("\n\n") + query
    )}
- Chunk IDs: ${chunks.map((c) => c.chunkId).join(", ")}

📝 **First Chunk Preview:**
"${preview}"

${
  chunks.length > 1
    ? `📄 Additional chunks (${chunks.length - 1}) follow in the context window.`
    : ""
}

This demonstrates how retrieved chunks fill the LLM's context window before generating a response.`,
  };

  return responses[template];
}

export function simulateGeneration({
  query,
  chunks,
  options,
}: {
  query: string;
  chunks: RetrievalResult[];
  options: {
    provider: LLMProvider;
    model: LLMModelId;
    promptTemplate: PromptTemplateId;
    temperature: number;
    maxTokens: number;
  };
}): { result: GenerationResult; logs: LogEntry[] } {
  const logs: LogEntry[] = [];
  const addLog = (message: string) => {
    logs.push({
      id: crypto.randomUUID(),
      tsISO: new Date().toISOString(),
      message,
    });
  };

  const chunksToUse = chunks.slice(0, 5); // Use top 5 chunks max
  const { tokenCount } = buildPrompt(query, chunksToUse, options.promptTemplate);

  addLog("Prompt prepared");
  addLog(`Using template: ${PROMPT_TEMPLATES[options.promptTemplate].name}`);
  addLog(`Sending ${chunksToUse.length} chunk${chunksToUse.length > 1 ? "s" : ""}`);
  addLog(`Input tokens: ${tokenCount}`);

  // Simulate LLM latency based on model and token count
  const baseLatency =
    options.provider === "local" ? 500 : options.provider === "openai" ? 800 : 1200;
  const tokenLatency = tokenCount * 0.5;
  const latencyMs = Math.floor(baseLatency + tokenLatency + Math.random() * 300);

  // Generate mock response
  const response = generateMockResponse(query, chunksToUse, options.promptTemplate);
  const outputTokens = countTokensApprox(response);

  addLog("Generating response...");
  addLog(`Model: ${options.model}`);
  addLog(`Temperature: ${options.temperature}`);
  addLog(`Output tokens: ${outputTokens}`);
  addLog(`Latency: ${latencyMs}ms`);
  addLog("Response completed");

  return {
    result: {
      response,
      inputTokens: tokenCount,
      outputTokens,
      latencyMs,
      chunksUsed: chunksToUse.length,
    },
    logs,
  };
}
