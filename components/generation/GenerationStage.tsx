"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogViewer } from "@/components/ui/log-viewer";
import { usePlaygroundStore } from "@/store/playgroundStore";
import { PROMPT_TEMPLATES } from "@/lib/generation";
import { Sparkles, RotateCcw } from "lucide-react";
import LLMControls from "./LLMControls";
import PromptTemplateSelector from "./PromptTemplateSelector";
import RetrievedChunksDisplay from "./RetrievedChunksDisplay";
import ResponseArea from "./ResponseArea";

export default function GenerationStage() {
  const {
    generationOptions,
    setGenerationOptions,
    generationResult,
    generationLogs,
    isGenerating,
    generateResponse,
    resetGeneration,
    rerankedResults,
    retrievalResults,
    retrievalOptions,
  } = usePlaygroundStore();

  const chunksToUse =
    rerankedResults.length > 0 ? rerankedResults : retrievalResults;
  const hasResults = chunksToUse.length > 0;
  const currentTemplate = PROMPT_TEMPLATES[generationOptions.promptTemplate];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">8) LLM Generation</h2>
          <p className="text-muted-foreground">
            Generate responses using retrieved context with configurable prompts
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetGeneration}
            disabled={!generationResult}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={generateResponse}
            disabled={!hasResults || isGenerating}
            className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Response"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          {/* Query Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">User Query</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-muted rounded-lg font-medium">
                {retrievalOptions.query || (
                  <span className="text-muted-foreground italic">
                    No query set - go to retrieval stage first
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Prompt Template */}
          <PromptTemplateSelector
            value={generationOptions.promptTemplate}
            onChange={(template) => setGenerationOptions({ promptTemplate: template })}
          />

          {/* Template Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Template Preview
                <Badge variant="outline">{currentTemplate.name}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  System Prompt
                </label>
                <div className="mt-1 p-3 bg-muted rounded-lg text-sm">
                  {currentTemplate.systemPrompt}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  User Prompt Template
                </label>
                <div className="mt-1 p-3 bg-muted rounded-lg text-sm font-mono whitespace-pre-wrap">
                  {currentTemplate.userPromptTemplate}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LLM Controls */}
          <LLMControls
            provider={generationOptions.provider}
            model={generationOptions.model}
            temperature={generationOptions.temperature}
            maxTokens={generationOptions.maxTokens}
            onProviderChange={(provider) =>
              setGenerationOptions({ provider })
            }
            onModelChange={(model) => setGenerationOptions({ model })}
            onTemperatureChange={(temperature) => setGenerationOptions({ temperature })}
            onMaxTokensChange={(maxTokens) => setGenerationOptions({ maxTokens })}
          />
        </div>

        {/* Right Column - Chunks and Response */}
        <div className="space-y-6">
          {/* Retrieved Chunks */}
          <RetrievedChunksDisplay chunks={chunksToUse} />

          {/* Response Area */}
          {generationResult && (
            <ResponseArea
              response={generationResult.response}
              inputTokens={generationResult.inputTokens}
              outputTokens={generationResult.outputTokens}
              latencyMs={generationResult.latencyMs}
              chunksUsed={generationResult.chunksUsed}
            />
          )}

          {/* Logs */}
          <LogViewer logs={generationLogs} stage="generation" />
        </div>
      </div>
    </div>
  );
}
