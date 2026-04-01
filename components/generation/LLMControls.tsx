"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import type { LLMProvider, LLMModelId } from "@/types/pipeline";
import { defaultModelForLLMProvider } from "@/lib/generation";
import { Cpu, Thermometer, Hash } from "lucide-react";

interface LLMControlsProps {
  provider: LLMProvider;
  model: LLMModelId;
  temperature: number;
  maxTokens: number;
  onProviderChange: (provider: LLMProvider) => void;
  onModelChange: (model: LLMModelId) => void;
  onTemperatureChange: (temperature: number) => void;
  onMaxTokensChange: (maxTokens: number) => void;
}

const PROVIDERS: { id: LLMProvider; name: string; badge: string }[] = [
  { id: "openai", name: "OpenAI", badge: "GPT-4" },
  { id: "anthropic", name: "Anthropic", badge: "Claude" },
  { id: "google", name: "Google", badge: "Gemini" },
  { id: "local", name: "Local", badge: "On-device" },
];

const MODELS: Record<LLMProvider, { id: LLMModelId; name: string; desc: string }[]> = {
  openai: [
    { id: "gpt-4o", name: "GPT-4o", desc: "Most capable" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", desc: "Fast & efficient" },
  ],
  anthropic: [
    { id: "claude-3-sonnet", name: "Claude 3 Sonnet", desc: "Balanced" },
    { id: "claude-3-haiku", name: "Claude 3 Haiku", desc: "Fast" },
  ],
  google: [
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", desc: "Advanced" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", desc: "Fast" },
  ],
  local: [
    { id: "llama-3.1-8b", name: "Llama 3.1 8B", desc: "Local inference" },
  ],
};

export default function LLMControls({
  provider,
  model,
  temperature,
  maxTokens,
  onProviderChange,
  onModelChange,
  onTemperatureChange,
  onMaxTokensChange,
}: LLMControlsProps) {
  const handleProviderChange = (newProvider: LLMProvider) => {
    onProviderChange(newProvider);
    // Auto-select default model for provider
    const defaultModel = defaultModelForLLMProvider(newProvider);
    onModelChange(defaultModel);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Cpu className="h-4 w-4" />
          LLM Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider */}
        <div className="space-y-2">
          <Label>Provider</Label>
          <select
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.badge})
              </option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div className="space-y-2">
          <Label>Model</Label>
          <select
            value={model}
            onChange={(e) => onModelChange(e.target.value as LLMModelId)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {MODELS[provider].map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} - {m.desc}
              </option>
            ))}
          </select>
        </div>

        {/* Temperature */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Temperature
            </Label>
            <Badge variant="outline">{temperature.toFixed(1)}</Badge>
          </div>
          <Slider
            value={[temperature]}
            onValueChange={(v: number[]) => onTemperatureChange(v[0] ?? 0)}
            min={0}
            max={2}
            step={0.1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Precise (0.0)</span>
            <span>Balanced (1.0)</span>
            <span>Creative (2.0)</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Max Tokens
            </Label>
            <Badge variant="outline">{maxTokens}</Badge>
          </div>
          <Slider
            value={[maxTokens]}
            onValueChange={(v: number[]) => onMaxTokensChange(v[0] ?? 1024)}
            min={256}
            max={4096}
            step={128}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Short (256)</span>
            <span>Medium (1024)</span>
            <span>Long (4096)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
