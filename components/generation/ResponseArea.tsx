"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bot, Clock, Hash, FileText, Sparkles } from "lucide-react";

interface ResponseAreaProps {
  response: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  chunksUsed: number;
}

export default function ResponseArea({
  response,
  inputTokens,
  outputTokens,
  latencyMs,
  chunksUsed,
}: ResponseAreaProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!response) return;

    // Reset and start typing animation - use setTimeout to avoid setState in effect body warning
    const startTimeout = setTimeout(() => {
      setDisplayedText("");
      setIsTyping(true);

      let currentIndex = 0;
      const textLength = response.length;
      
      // Calculate typing speed: aim for ~50ms per character, but adjust for response length
      // Longer responses type faster to keep animation reasonable
      const baseSpeed = 30; // ms per character
      const speed = Math.max(10, Math.min(50, baseSpeed - textLength / 100));

      const typeChar = () => {
        if (currentIndex < textLength) {
          // Add multiple characters at once for longer responses to speed it up
          const charsToAdd = textLength > 500 ? 3 : textLength > 200 ? 2 : 1;
          const nextIndex = Math.min(currentIndex + charsToAdd, textLength);
          setDisplayedText(response.slice(0, nextIndex));
          currentIndex = nextIndex;
          setTimeout(typeChar, speed);
        } else {
          setIsTyping(false);
        }
      };

      typeChar();
    }, 100);

    return () => clearTimeout(startTimeout);
  }, [response]);

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bot className="h-4 w-4" />
          LLM Response
          {isTyping && (
            <Badge variant="secondary" className="animate-pulse">
              <Sparkles className="h-3 w-3 mr-1" />
              Generating...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Response text with typing animation */}
        <div className="relative">
          <div className="p-4 bg-muted/50 rounded-lg min-h-30">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {displayedText}
              {isTyping && (
                <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
              )}
            </p>
          </div>
        </div>

        <Separator />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Input Tokens</p>
              <p className="text-sm font-medium">{inputTokens.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Output Tokens</p>
              <p className="text-sm font-medium">{outputTokens.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Latency</p>
              <p className="text-sm font-medium">{latencyMs}ms</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Chunks Used</p>
              <p className="text-sm font-medium">{chunksUsed}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
