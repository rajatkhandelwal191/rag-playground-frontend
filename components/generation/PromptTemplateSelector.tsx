"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PromptTemplateId } from "@/types/pipeline";
import { PROMPT_TEMPLATES } from "@/lib/generation";
import { FileText, Shield, Quote, AlignLeft, Layers } from "lucide-react";

interface PromptTemplateSelectorProps {
  value: PromptTemplateId;
  onChange: (template: PromptTemplateId) => void;
}

const TEMPLATES = [
  {
    id: "basic-qa" as PromptTemplateId,
    name: "Basic Q&A",
    description: "Standard question-answering with context",
    icon: FileText,
  },
  {
    id: "strict-grounded" as PromptTemplateId,
    name: "Strict Grounded",
    description: "Only answer if information is in the context",
    icon: Shield,
  },
  {
    id: "cited-answer" as PromptTemplateId,
    name: "Cited Answer",
    description: "Answer with citations to source chunks",
    icon: Quote,
  },
  {
    id: "summarization" as PromptTemplateId,
    name: "Summarization",
    description: "Summarize the retrieved content",
    icon: AlignLeft,
  },
  {
    id: "context-window" as PromptTemplateId,
    name: "Context Window",
    description: "Show how context fits in token window",
    icon: Layers,
  },
];

export default function PromptTemplateSelector({
  value,
  onChange,
}: PromptTemplateSelectorProps) {
  const currentTemplate = PROMPT_TEMPLATES[value];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Prompt Template</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2">
          {TEMPLATES.map((template) => {
            const Icon = template.icon;
            const isSelected = value === template.id;
            return (
              <button
                key={template.id}
                onClick={() => onChange(template.id)}
                className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-muted-foreground/25"
                }`}
              >
                <div
                  className={`p-2 rounded-md ${
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{template.name}</span>
                    {isSelected && (
                      <Badge variant="default" className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {template.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Selected: </span>
            {currentTemplate.name}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
